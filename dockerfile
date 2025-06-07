# Etapa 1: Build
FROM golang:1.24.0-alpine3.21 AS builder

WORKDIR /app


COPY go.* ./ 

RUN go mod download

COPY . .

RUN go build -o main ./cmd/api

EXPOSE 8080

CMD ["./main"]
