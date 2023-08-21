// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"context"
	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"io"
	"net/http"
	"time"
)

// LocalizedString is a struct for localized strings
type LocalizedString struct {
	De string `json:"de,omitempty" bson:"de,omitempty"`
	En string `json:"en,omitempty" bson:"en,omitempty"`
	It string `json:"it,omitempty" bson:"it,omitempty"`
}

// Get gets the localized string for a language
func (ls *LocalizedString) Get(lang string) string {
	switch lang {
	case "de":
		return ls.De
	case "en":
		return ls.En
	case "it":
		return ls.It
	default:
		return ""
	}
}

// GetDefault gets the string for the default language
func (ls *LocalizedString) GetDefault() string {
	return ls.Get("en")
}

// DefaultContext creates a default context with a timeout of 30 seconds
func DefaultContext() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return ctx
}

// GetFromUrl fetches bytes from an url
func (app *TasteBuddyApp) GetFromUrl(url string) ([]byte, error) {
	// fetch from url
	req, err := http.NewRequest(http.MethodGet, url, http.NoBody)
	if err != nil {
		return []byte{}, app.LogError("GetFromUrl", err)
	}

	// set headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0")

	// send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return []byte{}, app.LogError("GetFromUrl", err)
	}

	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			app.LogError("GetFromUrl", err)
		}
	}(resp.Body)

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return []byte{}, app.LogError("GetFromUrl", err)
	}

	return body, nil
}

func MostSimilarString(str string, strings []string, threshold float64) string {
	// Get city whose name is most similar to the given city
	mostSimilarString := ""
	var mostSimilarity float64 = 0
	for _, s := range strings {
		if similarity := strutil.Similarity(str, s, metrics.NewHamming()); similarity > mostSimilarity && similarity > threshold {
			mostSimilarString = s
			mostSimilarity = similarity
		}
	}
	return mostSimilarString
}
