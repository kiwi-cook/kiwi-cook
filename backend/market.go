package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

type MarketLocation struct {
	Coordinates Coordinates `json:"coordinates,omitempty" bson:"coordinates,omitempty"`
	City        string      `json:"city" bson:"city"`
	Street      string      `json:"street" bson:"street"`
	ZipCode     string      `json:"zipCode" bson:"zipCode"`
}

type Coordinates struct {
	Latitude  float64 `json:"lat,omitempty" bson:"lat,omitempty"`
	Longitude float64 `json:"lon,omitempty" bson:"lon,omitempty"`
}

type Market struct {
	ID                          string         `json:"_id,omitempty" bson:"_id,omitempty"`
	Distributor                 string         `json:"dist" bson:"dist"`
	DistributorSpecificMarketID string         `json:"distMarketId" bson:"distMarketId"`
	MarketName                  string         `json:"name" bson:"name"`
	Location                    MarketLocation `json:"location,omitempty" bson:"location,omitempty"`
}

// HandleGetMarkets gets called by router
// Calls getMarkets and handles the context
func HandleGetMarkets(context *gin.Context) {
	city := context.Param("city")
	context.JSON(200, getMarkets(city))
}

// Get all markets for a city
func getMarkets(city string) []Market {
	var markets []Market
	var functions = []func(string) ([]Market, error){getEdekaMarkets, getReweMarkets}
	for _, function := range functions {
		m, err := function(city)
		if err != nil {
			log.Print(err)
			continue
		}
		markets = append(markets, m...)
	}
	if markets == nil {
		markets = []Market{}
	}
	return markets
}
