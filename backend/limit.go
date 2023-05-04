// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	maxRequestsPerIP = 100
	resetInterval    = 5 * time.Minute
)

type requestCounter struct {
	counts   map[string]int
	lastSeen map[string]time.Time
	mutex    sync.Mutex
}

func newRequestCounter() *requestCounter {
	return &requestCounter{
		counts:   make(map[string]int),
		lastSeen: make(map[string]time.Time),
	}
}

func (c *requestCounter) increment(ip string) int {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	count := c.counts[ip] + 1
	c.counts[ip] = count
	c.lastSeen[ip] = time.Now()
	return count
}

func (c *requestCounter) reset() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	now := time.Now()
	for ip, lastSeen := range c.lastSeen {
		if now.Sub(lastSeen) > resetInterval {
			delete(c.counts, ip)
			delete(c.lastSeen, ip)
		}
	}
}

// LimitRequestsMiddleware limits the number of requests per IP address
func LimitRequestsMiddleware() gin.HandlerFunc {
	counter := newRequestCounter()

	// Start background goroutine to reset counters periodically
	go func() {
		for range time.Tick(resetInterval) {
			counter.reset()
		}
	}()

	return func(c *gin.Context) {
		// Skip API limitation, if the request is authenticated
		sessionToken := c.GetString("SessionToken")
		if sessionToken != "" {
			c.Next()
			return
		}

		ip := c.ClientIP()

		if count := counter.increment(ip); count > maxRequestsPerIP {
			TooManyRequests(c)
			return
		}
		c.Next()
	}
}
