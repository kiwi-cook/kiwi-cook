package main

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

// HandleGetMarketsByCity gets called by router
// Calls getMarkets and handles the context
func (app *TasteBuddyApp) HandleGetMarketsByCity(context *gin.Context) {
	city := context.Param("city")
	if markets, err := app.client.GetMarketsByCity(city); err != nil {
		LogError("HandleGetMarketsByCity", err)
		ServerError(context, true)
	} else {
		SuccessJSON(context, markets)
	}
}

// HandleGetAllMarkets gets called by router
// Calls getMarkets and handles the context
func (app *TasteBuddyApp) HandleGetAllMarkets(context *gin.Context) {
	if markets, err := app.client.GetAllMarkets(); err != nil {
		LogError("HandleGetAllMarkets", err)
		ServerError(context, true)
	} else {
		SuccessJSON(context, markets)
	}
}

// getMarketsCollection gets markets collection from database
func (client *TasteBuddyDatabase) GetMarketsCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("markets")
}

// getMarketsByCityFromDB gets all markets for a city from the db or the api
func (client *TasteBuddyDatabase) GetMarketsByCity(city string) ([]Market, error) {
	ctx := DefaultContext()
	collection := client.GetMarketsCollection()
	cursor, err := collection.Find(ctx, bson.D{{Key: "location.city", Value: city}})
	if err != nil {
		LogError("GetMarketsByCity + "+city, err)
		return []Market{}, err
	}
	var markets []Market
	if err = cursor.All(ctx, &markets); err != nil {
		LogError("GetMarketsByCity + "+city, err)
		return []Market{}, err
	}
	return markets, nil
}

// getAllMarketsFromDB gets markets from database
func (client *TasteBuddyDatabase) GetAllMarkets() ([]Market, error) {
	ctx := DefaultContext()
	collection := client.GetMarketsCollection()
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		LogError("GetAllMarkets", err)
		return []Market{}, err
	}
	var markets []Market
	if err = cursor.All(ctx, &markets); err != nil {
		LogError("GetAllMarkets", err)
		return []Market{}, err
	}
	return markets, nil
}

// GetAllMarketIDsByCity gets all marketIDs for a city
func (client *TasteBuddyDatabase) GetAllMarketIDsByCity(city string) []string {
	if markets, err := client.GetMarketsByCity(city); err != nil {
		LogError("GetAllMarketIDsByCity + "+city, err)
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
func (client *TasteBuddyDatabase) AddMarkets(markets []Market) error {
	ctx := DefaultContext()
	Log("AddMarkets", "Add "+strconv.Itoa(len(markets))+" markets to database")

	// Insert all markets
	opts := options.Update().SetUpsert(true)
	collection := client.GetMarketsCollection()
	for _, market := range markets {

		// Upsert market
		_, err := collection.UpdateOne(ctx, bson.D{{Key: "distMarketId", Value: market.DistributorSpecificMarketID}}, bson.D{{Key: "$set", Value: market}}, opts)
		if err != nil {
			LogError("AddMarkets + "+market.MarketName, err)
			return err
		}
	}

	return nil
}

// GetMarketsByCityFromAPI gets all markets for a city
func GetMarketsByCityFromAPI(city string) []Market {
	var markets []Market
	var functions = []func(string) ([]Market, error){GetEdekaMarkets, GetReweMarkets}
	for _, function := range functions {
		m, err := function(city)
		if err != nil {
			LogError("GetMarketsByCityFromAPI + "+city, err)
			continue
		}
		markets = append(markets, m...)
	}
	if markets == nil {
		markets = []Market{}
	}
	Log("GetMarketsByCityFromAPI + "+city, "Found "+strconv.Itoa(len(markets))+" markets for "+city)
	return markets
}

// GoRoutineSaveMarketsToDB saves markets from different cities to database
// Is Goroutine
func GoRoutineSaveMarketsToDB(client *TasteBuddyDatabase) {
	cities := []string{
		"Konstanz",
		"Berlin",
		"Hamburg",
		"Muenchen",
	}

	Log("GoRoutineSaveMarketsToDB", "Start saving markets to database")
	for _, city := range cities {
		go client.SaveMarketsFromAPI(city)
	}
}

// SaveMarketsFromAPI gets all markets for a city and save them to the db
// Helper function for GoRoutineSavemarketsToDB
func (client *TasteBuddyDatabase) SaveMarketsFromAPI(city string) {
	Log("SaveMarketsFromAPI + "+city, "Save markets")
	markets := GetMarketsByCityFromAPI(city)
	if err := client.AddMarkets(markets); err != nil {
		LogError("SaveMarketsFromAPI", err)
		return
	}
	Log("SaveMarketsFromAPI + "+city, "Done saving markets")
}
