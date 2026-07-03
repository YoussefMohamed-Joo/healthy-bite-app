FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o proxy .

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/proxy .

EXPOSE 8080
CMD ["./proxy"]
