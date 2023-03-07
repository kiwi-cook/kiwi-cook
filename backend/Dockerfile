# syntax=docker/dockerfile:1

FROM golang:1.19.4-bullseye

WORKDIR /

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o /app

ENV PORT 8081
EXPOSE ${PORT}

CMD [ "/app" ]