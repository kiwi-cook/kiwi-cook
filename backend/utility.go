// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"context"
	"strconv"
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

// GenerateID generates a new ID
func GenerateID(pre string) string {
	return pre + strconv.FormatInt(time.Now().UnixNano(), 10)
}
