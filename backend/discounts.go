package main

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Discount struct {
	ID               primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"` // id of the product
	Title            string             `json:"title" bson:"title"`                 // title of the product
	Price            string             `json:"price" bson:"price"`                 // price of the product
	ImageUrl         string             `json:"imageUrl" bson:"imageUrl"`
	ValidUntil       int                `json:"validUntil" bson:"validUntil"` // unix timestamp
	MarketName       string             `json:"marketName" bson:"marketName"`
	InternalMarketID string             `json:"internalMarketId,omitempty" bson:"internalMarketId,omitempty"`
	Tags             []string           `json:"-" bson:"_tags"`
}

// HandleGetDiscountsByCity gets called by router
// Calls getDiscountsFromDBOrAPI and handles the context
func (app *TasteBuddyApp) HandleGetDiscountsByCity(context *gin.Context) {
	city := context.Param("city")
	Log("HandleGetDiscountsByCity", "Get discounts for city "+city)
	if discounts, err := app.client.GetDiscountsByCity(city); err != nil {
		LogError("HandleGetDiscountsByCity + "+city, err)
		ServerError(context, true)
	} else {
		SuccessJSON(context, discounts)
	}
}

// HandleGetDiscounts gets called by router
// Calls getDiscountsFromDB
func (app *TasteBuddyApp) HandleGetAllDiscounts(context *gin.Context) {
	Log("HandleGetAllDiscounts", "Get all discounts")
	if discounts, err := app.client.GetAllDiscounts(); err != nil {
		LogError("HandleGetAllDiscounts", err)
		ServerError(context, true)
	} else {
		SuccessJSON(context, discounts)
	}
}

// GetDiscountsCollection gets discounts collection from database
func (client *TasteBuddyDatabase) GetDiscountsCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("discounts")
}

// GetDiscountsByCity gets discounts by city from database
func (client *TasteBuddyDatabase) GetDiscountsByCity(city string) ([]Discount, error) {
	ctx := DefaultContext()

	// get marketIds for city
	marketIds := client.GetAllMarketIDsByCity(city)
	if len(marketIds) == 0 {
		return []Discount{}, errors.New("No markets found for " + city)
	}

	// get discounts for markets
	discountsFromDB, err := client.GetDiscountsCollection().Find(ctx, bson.D{{Key: "internalMarketId", Value: bson.D{{Key: "$in", Value: marketIds}}}})
	if err != nil {
		LogError("GetDiscountsByCity + "+city, err)
		return []Discount{}, err
	}

	// get discounts from database
	var discounts []Discount
	if err := discountsFromDB.All(ctx, &discounts); err != nil {
		LogError("GetDiscountsByCity + "+city, err)
		return []Discount{}, err
	}

	// there can be multiple copies of the same discount after the filter operation above
	var discountsMap = make(map[string]Discount)
	var filteredDiscounts = []Discount{}
	for _, discount := range discounts {
		// only add discount if it is not already in the map
		if _, ok := discountsMap[discount.Title]; !ok {
			discountsMap[discount.Title] = discount
		}
	}
	// convert map to array
	for _, discount := range discountsMap {
		filteredDiscounts = append(filteredDiscounts, discount)
	}
	discounts = filteredDiscounts

	Log("GetDiscountsByCity + "+city, "Return "+strconv.Itoa(len(discounts))+" discounts from database")
	return discounts, nil
}

// GetDiscountsFromAPI gets all discounts for a market from the market's API
func (market *Market) GetDiscountsFromAPI() ([]Discount, error) {
	switch market.Distributor {
	case "edeka":
		return GetEdekaDiscounts(*market)
	case "rewe":
		return GetReweDiscounts(*market)
	}
	return []Discount{}, nil
}

// GetAllDiscounts gets all discounts from database
func (client *TasteBuddyDatabase) GetAllDiscounts() ([]Discount, error) {
	ctx := DefaultContext()
	cursor, err := client.GetDiscountsCollection().Find(ctx, bson.M{})
	if err != nil {
		LogError("GetAllDiscounts", err)
		return []Discount{}, err
	}
	var discounts []Discount
	if err = cursor.All(ctx, &discounts); err != nil {
		LogError("GetAllDiscounts", err)
		return []Discount{}, err
	}
	return discounts, nil
}

// AddDiscounts adds discounts to database
func (client *TasteBuddyDatabase) AddDiscounts(discounts []Discount) error {
	Log("AddDiscounts", "Add "+strconv.Itoa(len(discounts))+" discounts to database")

	// Insert all markets
	opts := options.Update().SetUpsert(true)
	collection := client.GetDiscountsCollection()
	for _, discount := range discounts {

		// Upsert market
		ctx := DefaultContext()
		if _, err := collection.UpdateOne(ctx, bson.M{"internalMarketId": discount.InternalMarketID, "title": discount.Title}, bson.D{{Key: "$set", Value: discount}}, opts); err != nil {
			LogError("AddDiscounts + "+discount.ID.String(), err)
			return err
		}
	}

	return nil
}

// GetDiscountsByCityFromAPI gets all discounts for a city from the market's APIs
func (client *TasteBuddyDatabase) GetDiscountsByCityFromAPI(city string) []Discount {
	if markets, err := client.GetMarketsByCity(city); err != nil {
		LogError("GetDiscountsByCityFromAPI", err)
		return []Discount{}
	} else {
		var discounts []Discount
		for _, market := range markets {
			discountsForMarket, err := market.GetDiscountsFromAPI()
			if err != nil {
				LogError("GetDiscountsByCityFromAPI + "+city, err)
				continue
			}
			discounts = append(discounts, discountsForMarket...)
		}
		return discounts
	}
}

// GoRoutineSaveDiscountsToDB save discounts from different cities to the database
// Is Goroutine
func GoRoutineSaveDiscountsToDB(client *TasteBuddyDatabase) {
	cities := []string{
		"Konstanz",
		"Berlin",
		"Hamburg",
		"Muenchen",
	}

	Log("GoRoutineSaveDiscountsToDB", "Start saving discounts to database")
	for _, city := range cities {
		go client.SaveDiscountsFromAPI(city)
	}
}

// SaveDiscountsFromAPI saves discounts to database
func (client *TasteBuddyDatabase) SaveDiscountsFromAPI(city string) {
	Log("SaveDiscountsFromAPI", "Save discounts for "+city)
	discounts := client.GetDiscountsByCityFromAPI(city)
	if err := client.AddDiscounts(discounts); err != nil {
		LogError("SaveDiscountsFromAPI + "+city, err)
		return
	}
	Log("SaveDiscountsFromAPI + "+city, "Done saving discounts")
}
