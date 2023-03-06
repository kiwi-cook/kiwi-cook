# syntax=docker/dockerfile:1

FROM golang:1.19.4-bullseye

WORKDIR /

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./

RUN go build -o /app

EXPOSE 8081

CMD [ "/app" ]