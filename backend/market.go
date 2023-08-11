// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"strconv"
)

type MarketLocation struct {
	Coordinates Coordinates `json:"coordinates,omitempty" bson:"coordinates,omitempty"`
	City        string      `json:"city,omitempty" bson:"city,omitempty"`
	Street      string      `json:"street,omitempty" bson:"street,omitempty"`
	ZipCode     string      `json:"zipCode,omitempty" bson:"zipCode,omitempty"`
}

type Coordinates struct {
	Latitude  float64 `json:"lat,omitempty" bson:"lat,omitempty"`
	Longitude float64 `json:"lon,omitempty" bson:"lon,omitempty"`
}

type Market struct {
	ID                          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Distributor                 string             `json:"dist,omitempty" bson:"dist,omitempty"`
	DistributorSpecificMarketID string             `json:"distMarketId,omitempty" bson:"distMarketId,omitempty"`
	MarketName                  string             `json:"name,omitempty" bson:"name,omitempty"`
	Location                    MarketLocation     `json:"location,omitempty" bson:"location,omitempty"`
}

// HandleGetMarketsByCity gets called by server
// Calls getMarkets and handles the context
func (server *TasteBuddyServer) HandleGetMarketsByCity(context *gin.Context) {
	city := context.Param("city")
	if markets, err := server.GetMarketsByCity(city); err != nil {
		server.LogError("HandleGetMarketsByCity", err)
		ServerError(context, true)
	} else {
		Success(context, markets)
	}
}

// HandleGetAllMarkets gets called by server
// Calls getMarkets and handles the context
func (server *TasteBuddyServer) HandleGetAllMarkets(context *gin.Context) {
	if markets, err := server.GetAllMarkets(); err != nil {
		server.LogError("HandleGetAllMarkets", err)
		ServerError(context, true)
	} else {
		Success(context, markets)
	}
}

// GetMarketsCollection gets markets collection from database
func (app *TasteBuddyApp) GetMarketsCollection() *TBCollection {
	return app.GetDBCollection("markets")
}

func (app *TasteBuddyApp) GetCitiesWithMarkets() []string {
	if citiesInterface, err := app.GetMarketsCollection().Distinct(DefaultContext(), "location.city", bson.D{}); err != nil {
		app.LogError("GetCities", err)
		return []string{}
	} else {
		cities := make([]string, len(citiesInterface))
		for i, v := range citiesInterface {
			cities[i] = fmt.Sprint(v)
		}
		app.LogDebug("GetCities", "Found "+strconv.Itoa(len(cities))+" cities with markets")
		return cities
	}
}

// GetMarketsByCity gets all markets for a city from the db or the api
func (app *TasteBuddyApp) GetMarketsByCity(city string) ([]Market, error) {
	ctx := DefaultContext()
	city = MostSimilarString(city, app.GetCitiesWithMarkets(), 0.5)
	app.Log("GetMarketsByCity", "Get markets for "+city)

	collection := app.GetMarketsCollection()
	cursor, err := collection.Find(ctx, bson.D{{Key: "location.city", Value: city}})
	if err != nil {
		app.LogError("GetMarketsByCity + "+city, err)
		return []Market{}, err
	}
	var markets []Market
	if err = cursor.All(ctx, &markets); err != nil {
		app.LogError("GetMarketsByCity + "+city, err)
		return []Market{}, err
	}
	return markets, nil
}

// GetAllMarkets gets markets from database
func (app *TasteBuddyApp) GetAllMarkets() ([]Market, error) {
	ctx := DefaultContext()
	collection := app.GetMarketsCollection()
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		app.LogError("GetAllMarkets", err)
		return []Market{}, err
	}
	var markets []Market
	if err = cursor.All(ctx, &markets); err != nil {
		app.LogError("GetAllMarkets", err)
		return []Market{}, err
	}
	return markets, nil
}

// GetAllMarketIDsByCity gets all marketIDs for a city
func (app *TasteBuddyApp) GetAllMarketIDsByCity(city string) []string {
	if markets, err := app.GetMarketsByCity(city); err != nil {
		app.LogError("GetAllMarketIDsByCity + "+city, err)
		return []string{}
	} else {
		var marketIDs []string
		for _, market := range markets {
			marketIDs = append(marketIDs, market.ID.Hex())
		}
		return marketIDs
	}
}

// AddMarkets adds markets to database
func (app *TasteBuddyApp) AddMarkets(markets []Market) error {
	ctx := DefaultContext()
	app.Log("AddMarkets", "Add "+strconv.Itoa(len(markets))+" markets to database")

	// Insert all markets
	opts := options.Update().SetUpsert(true)
	collection := app.GetMarketsCollection()
	for _, market := range markets {

		// Upsert market
		if _, err := collection.UpdateOne(ctx, bson.D{{Key: "distMarketId", Value: market.DistributorSpecificMarketID}}, bson.D{{Key: "$set", Value: market}}, opts); err != nil {
			return app.LogError("AddMarkets + "+market.MarketName, err)
		}
	}

	return nil
}

// GetMarketsByCityFromAPI gets all markets for a city
func (app *TasteBuddyApp) GetMarketsByCityFromAPI(city string) []Market {
	var markets []Market
	var functions = []func(string) ([]Market, error){app.GetEdekaMarkets, app.GetReweMarkets}
	for _, function := range functions {
		m, err := function(city)
		if err != nil {
			app.LogError("GetMarketsByCityFromAPI + "+city, err)
			continue
		}
		markets = append(markets, m...)
	}
	if markets == nil {
		markets = []Market{}
	}
	app.Log("GetMarketsByCityFromAPI + "+city, "Found "+strconv.Itoa(len(markets))+" markets for "+city)
	return markets
}

// GoRoutineSaveMarketsToDB saves markets from different cities to database
// Is Goroutine
func (app *TasteBuddyApp) GoRoutineSaveMarketsToDB(cities []string) {
	app.Log("GoRoutineSaveMarketsToDB", "Start saving markets to database")
	for _, city := range cities {
		go app.SaveMarketsFromAPI(city)
	}
}

// SaveMarketsFromAPI gets all markets for a city and save them to the db
// Helper function for GoRoutineSavemarketsToDB
func (app *TasteBuddyApp) SaveMarketsFromAPI(city string) {
	app.Log("SaveMarketsFromAPI + "+city, "Save markets")
	markets := app.GetMarketsByCityFromAPI(city)
	if err := app.AddMarkets(markets); err != nil {
		app.LogError("SaveMarketsFromAPI", err)
		return
	}
	app.Log("SaveMarketsFromAPI + "+city, "Done saving markets")
}
