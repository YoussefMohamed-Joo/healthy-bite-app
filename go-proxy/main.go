package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type Config struct {
	UpstreamURL string
	Port        string
	RateLimit   rate.Limit
	Burst       int
	BlockedIPs  []string
	AllowedOrigins []string
}

type RateLimiterStore struct {
	mu       sync.Mutex
	clients  map[string]*rate.Limiter
	blocked  map[string]time.Time
}

func NewRateLimiterStore() *RateLimiterStore {
	return &RateLimiterStore{
		clients: make(map[string]*rate.Limiter),
		blocked: make(map[string]time.Time),
	}
}

func (s *RateLimiterStore) GetLimiter(ip string, r rate.Limit, b int) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()

	limiter, exists := s.clients[ip]
	if !exists {
		limiter = rate.NewLimiter(r, b)
		s.clients[ip] = limiter
	}
	return limiter
}

func (s *RateLimiterStore) IsBlocked(ip string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	blockTime, exists := s.blocked[ip]
	if !exists {
		return false
	}
	if time.Since(blockTime) > 15*time.Minute {
		delete(s.blocked, ip)
		return false
	}
	return true
}

func (s *RateLimiterStore) BlockIP(ip string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.blocked[ip] = time.Now()
}

var store = NewRateLimiterStore()

func loadConfig() Config {
	upstream := os.Getenv("UPSTREAM_URL")
	if upstream == "" {
		upstream = "http://localhost:5000"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{
		UpstreamURL: upstream,
		Port:        port,
		RateLimit:   20,
		Burst:       5,
		AllowedOrigins: []string{
			"https://helthybite.vercel.app",
			"http://localhost:5173",
			"http://localhost:3000",
		},
	}
}

func isAllowedOrigin(origin string, allowed []string) bool {
	if origin == "" {
		return true
	}
	for _, a := range allowed {
		if strings.HasPrefix(origin, a) || strings.HasSuffix(origin, ".vercel.app") {
			return true
		}
	}
	return false
}

func corsMiddleware(next http.Handler, config Config) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if isAllowedOrigin(origin, config.AllowedOrigins) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		} else if origin != "" {
			http.Error(w, `{"status":"error","message":"CORS blocked"}`, http.StatusForbidden)
			return
		}

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip = r.RemoteAddr
		}
		ip = strings.Split(ip, ",")[0]
		ip = strings.TrimSpace(ip)

		if store.IsBlocked(ip) {
			w.Header().Set("Retry-After", "900")
			http.Error(w, `{"status":"error","message":"IP blocked for excessive requests"}`, http.StatusTooManyRequests)
			return
		}

		// Stricter rate for auth endpoints
		limiterRate := rate.Limit(20)
		burst := 5
		path := r.URL.Path
		if strings.Contains(path, "/auth/login") || strings.Contains(path, "/auth/register") || strings.Contains(path, "/otp/") {
			limiterRate = 3
			burst = 2
		}

		limiter := store.GetLimiter(ip, limiterRate, burst)
		if !limiter.Allow() {
			store.BlockIP(ip)
			w.Header().Set("Retry-After", "900")
			http.Error(w, `{"status":"error","message":"Too many requests"}`, http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "healthy",
		"service": "healthybite-go-proxy",
		"time":    time.Now().Unix(),
	})
}

func main() {
	config := loadConfig()

	upstreamURL, err := url.Parse(config.UpstreamURL)
	if err != nil {
		log.Fatalf("Invalid upstream URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(upstreamURL)
	proxy.ModifyResponse = func(res *http.Response) error {
		res.Header.Del("X-Powered-By")
		return nil
	}

	mux := http.NewServeMux()

	// Health check for the proxy itself
	mux.HandleFunc("/proxy/health", healthHandler)

	// All other traffic -> proxy to Node.js
	mux.Handle("/", proxy)

	handler := securityHeadersMiddleware(rateLimitMiddleware(corsMiddleware(mux, config)))

	addr := fmt.Sprintf(":%s", config.Port)
	log.Printf("HealthyBite Go Proxy listening on %s → %s", addr, config.UpstreamURL)
	log.Printf("Rate limit: %.0f req/s, burst: %d", config.RateLimit, config.Burst)
	log.Printf("CORS allowed: %v", config.AllowedOrigins)

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
