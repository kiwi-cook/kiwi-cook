package main

import (
	"errors"
	"log"
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

// HandleGetDiscounts gets called by router
// Calls getDiscountsFromDBOrAPI and handles the context
func HandleGetDiscounts(context *gin.Context, client *mongo.Client) {
	city := context.Param("city")
	log.Print("[HandleGetDiscounts] Get discounts for city " + city)
	if discounts, err := getDiscountsByCityFromDB(client, city); err != nil {
		log.Print(err)
		ServerError(context, true)
	} else {
		SuccessJSON(context, discounts)
	}
}

// getDiscountsCollection gets discounts collection from database
func getDiscountsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("discounts")
}

// getDiscountsByCityFromDB gets discounts by city from database
func getDiscountsByCityFromDB(client *mongo.Client, city string) ([]Discount, error) {
	ctx := DefaultContext()

	// get marketIds for city
	marketIds := getAllMarketIDByCityFromDB(client, city)
	if len(marketIds) == 0 {
		return []Discount{}, errors.New("[getDiscountsByCityFromDB] No markets found for " + city)
	}

	// get discounts for markets
	discountsFromDB, err := getDiscountsCollection(client).Find(ctx, bson.D{{Key: "internalMarketId", Value: bson.D{{Key: "$in", Value: marketIds}}}})
	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}

	// get discounts from database
	var discounts []Discount
	if err := discountsFromDB.All(ctx, &discounts); err != nil {
		log.Print(err)
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

	log.Printf("Return %s discounts from database.", strconv.Itoa(len(discounts)))
	return discounts, nil
}

// getDiscountsForMarketFromAPI gets all discounts for a market from the market's API
func getDiscountsForMarketFromAPI(market Market) ([]Discount, error) {
	switch market.Distributor {
	case "edeka":
		return getEdekaDiscounts(market)
	case "rewe":
		return getReweDiscounts(market)
	}
	return []Discount{}, nil
}

// getAllDiscountsFromDB gets all discounts from database
func getAllDiscountsFromDB(client *mongo.Client) ([]Discount, error) {
	ctx := DefaultContext()
	cursor, err := getDiscountsCollection(client).Find(ctx, bson.M{})
	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}
	var discounts []Discount
	if err = cursor.All(ctx, &discounts); err != nil {
		log.Print(err)
		return []Discount{}, err
	}
	return discounts, nil
}

// addDiscountsToDB adds discounts to database
func addDiscountsToDB(client *mongo.Client, discounts []Discount) error {
	ctx := DefaultContext()
	log.Printf("[addDiscountsToDB] Add %s discounts to database...", strconv.Itoa(len(discounts)))

	// Insert all markets
	opts := options.Update().SetUpsert(true)
	collection := getDiscountsCollection(client)
	for _, discount := range discounts {

		// Upsert market
		if _, err := collection.UpdateOne(ctx, bson.M{"internalMarketId": discount.InternalMarketID, "title": discount.Title}, bson.D{{Key: "$set", Value: discount}}, opts); err != nil {
			log.Print(err)
			return err
		}
	}

	return nil
}

// getDiscountsByCityFromAPI gets all discounts for a city from the market's APIs
func getDiscountsByCityFromAPI(client *mongo.Client, city string) []Discount {
	if markets, err := getMarketsByCityFromDB(client, city); err != nil {
		log.Print(err)
		return []Discount{}
	} else {
		var discounts []Discount
		for _, market := range markets {
			discountsForMarket, err := getDiscountsForMarketFromAPI(market)
			if err != nil {
				log.Print(err)
				continue
			}
			discounts = append(discounts, discountsForMarket...)
		}
		return discounts
	}
}

// GoRoutineSaveDiscountsToDB save discounts from different cities to the database
// Is Goroutine
func GoRoutineSaveDiscountsToDB(client *mongo.Client) {
	cities := []string{
		"Konstanz",
		"Berlin",
		"Hamburg",
		"München",
	}

	log.Print("[GoRoutineSaveDiscountsToDB] Start saving discounts to database...")
	for _, city := range cities {
		go saveDiscountsFromAPIToDB(client, city)
	}
}

// saveDiscountsFromAPIToDB saves discounts to database
func saveDiscountsFromAPIToDB(client *mongo.Client, city string) {
	log.Printf("[saveDiscountsFromAPIToDB] Save discounts for %s...\n", city)
	discounts := getDiscountsByCityFromAPI(client, city)
	if err := addDiscountsToDB(client, discounts); err != nil {
		log.Print(err)
		return
	}
	log.Printf("[saveDiscountsFromAPIToDB] DONE...")
}
