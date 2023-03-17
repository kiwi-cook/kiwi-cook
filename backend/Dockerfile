# syntax=docker/dockerfile:1

FROM golang:1.20.1-buster as base

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid 65532 \
  small-user

WORKDIR $GOPATH/src/smallest-golang/app/

COPY go.mod ./
COPY go.sum ./
COPY *.go ./

RUN go mod download
RUN go mod verify

RUN CGO_ENABLED=0 GOOS=linux go build -o /app .

FROM scratch

COPY --from=base /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=base /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

COPY --from=base /app .

USER small-user:small-user

ENV PORT 8081
EXPOSE ${PORT}

CMD [ "/app" ]