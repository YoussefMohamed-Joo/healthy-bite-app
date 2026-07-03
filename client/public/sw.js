const CACHE = 'healthybite-v1'
const urls = ['/', '/menu', '/plans', '/about', '/contact']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(urls))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
