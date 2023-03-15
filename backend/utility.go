package main

import (
	"context"
	"io"
	"log"
	"net/http"
	"time"
)

// Create a default context with a timeout of 30 seconds
func DefaultContext() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return ctx
}

// Fetches bytes from a url
func GetFromUrl(url string) ([]byte, error) {
	// fetch from url
	req, err := http.NewRequest(http.MethodGet, url, http.NoBody)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	// set headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0")

	// send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	defer resp.Body.Close()

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	return body, nil
}
