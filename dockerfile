# Etapa 1: Build
FROM golang:1.24.0-alpine3.21 AS builder
WORKDIR /app

RUN apk add --no-cache make
RUN go install github.com/air-verse/air@latest
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

COPY go.* ./ 
RUN go mod download
COPY . .
RUN go build -o ./bin/main ./cmd/api

EXPOSE 8080
CMD ["air", "-c", ".air.toml"]
