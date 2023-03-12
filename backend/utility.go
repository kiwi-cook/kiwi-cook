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
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		LogError("GetFromUrl", err)
		return []byte{}, err
	}

	// set headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0")

	// send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		LogError("GetFromUrl", err)
		return []byte{}, err
	}

	defer resp.Body.Close()

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		LogError("GetFromUrl", err)
		return []byte{}, err
	}

	return body, nil
}

func Log(functionName string, message ...any) {
	if len(message) == 0 {
		log.Printf("INFO [%s]", functionName)
		return
	} else if len(message) == 1 {
		log.Printf("INFO [%s]: %v", functionName, message[0])
		return
	}
	log.Printf("INFO [%s]: %s", functionName, message)
}

// Log Error
func LogError(functionName string, err error) {
	const colorRed = "\033[0;31m"
	const colorNone = "\033[0m"

	log.Printf("%sERROR%s [%s]: %s", colorRed, colorNone, functionName, err)
}
