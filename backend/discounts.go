package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Discount struct {
	ID               string   `json:"_id,omitempty" bson:"_id,omitempty"` // id of the product
	Title            string   `json:"title" bson:"title"`                 // title of the product
	Price            string   `json:"price" bson:"price"`                 // price of the product
	ImageUrl         string   `json:"imageUrl" bson:"imageUrl"`
	ValidUntil       int      `json:"validUntil" bson:"validUntil"` // unix timestamp
	MarketName       string   `json:"marketName" bson:"marketName"`
	InternalMarketID string   `json:"internalMarketId" bson:"internalMarketId"`
	Tags             []string `json:"-" bson:"_tags"`
}

// HandleGetDiscounts gets called by router
// Calls getDiscountsFromDBOrAPI and handles the context
func HandleGetDiscounts(context *gin.Context, client *mongo.Client) {
	city := context.Param("city")
	log.Print(city)
	discounts, err := getDiscountsFromDBOrAPI(client, city)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(200, discounts)
}

// Get discounts from database or API
// TODO: add caching
// TODO: add pagination
// TODO: add sorting
// TODO: better filtering, pass tags as parameter
func getDiscountsFromDBOrAPI(client *mongo.Client, city string) ([]Discount, error) {
	ctx := DefaultContext()

	// check if discounts are in database
	log.Printf("Check if discounts for city %s are in database.", city)

	// very expensive query
	// TODO: improve query
	var discounts []Discount
	discountsFromDB, err := getDiscountsCollection(client).Aggregate(ctx, mongo.Pipeline{
		// unwind
		bson.D{{Key: "$unwind", Value: bson.D{{Key: "path", Value: "$_tags"}}}},
		// match tags using regex
		bson.D{{Key: "$match", Value: bson.D{{Key: "_tags", Value: bson.D{{Key: "$regex", Value: city}}}}}},
		// group discounts
		bson.D{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$_id"},
			{Key: "price", Value: bson.D{{Key: "$first", Value: "$price"}}},
			{Key: "title", Value: bson.D{{Key: "$first", Value: "$title"}}},
			{Key: "imageUrl", Value: bson.D{{Key: "$first", Value: "$imageUrl"}}},
			{Key: "validUntil", Value: bson.D{{Key: "$first", Value: "$validUntil"}}},
			{Key: "marketName", Value: bson.D{{Key: "$first", Value: "$marketName"}}},
			{Key: "internalMarketID", Value: bson.D{{Key: "$first", Value: "$internalMarketID"}}},
			{Key: "_tags", Value: bson.D{{Key: "$push", Value: "$_tags"}}}}}},
	})

	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}

	// get discounts from database
	if err := discountsFromDB.All(ctx, &discounts); err != nil {
		log.Print(err)
		return []Discount{}, err
	}
	var discountsFrom = "database"
	if len(discounts) == 0 {
		// if no discounts are in database, get them from API
		discountsFrom = "API"
		discounts = getDiscountsFromAPI(city)
		addDiscountsToDB(client, discounts)
	}
	log.Printf("Return %s discounts from %s.", strconv.Itoa(len(discounts)), discountsFrom)
	return discounts, nil
}

// Get all discounts for a market from the market's API
func getDiscountsForMarket(market Market) ([]Discount, error) {
	switch market.Distributor {
	case "edeka":
		return getEdekaDiscounts(market)
	case "rewe":
		return getReweDiscounts(market)
	}
	return []Discount{}, nil
}

// Get all discounts for a city from the market's APIs
func getDiscountsFromAPI(city string) []Discount {
	var markets = getMarkets(city)
	var discounts []Discount
	for _, market := range markets {
		discountsForMarket, err := getDiscountsForMarket(market)
		if err != nil {
			log.Print(err)
			continue
		}
		discounts = append(discounts, discountsForMarket...)
	}
	return discounts
}

// Get discounts from database
func getDiscountsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("discounts")
}

// Get all discounts from database
func getDiscountsFromDB(client *mongo.Client) ([]Discount, error) {
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

// Adds discounts to database
func addDiscountsToDB(client *mongo.Client, discounts []Discount) ([]Discount, error) {
	ctx := DefaultContext()
	log.Printf("Add %s discounts to database.", strconv.Itoa(len(discounts)))

	// prepare discounts for insertion
	var discountsAsDocument []interface{}
	for _, discount := range discounts {
		discountsAsDocument = append(discountsAsDocument, discount)
	}
	_, err := getDiscountsCollection(client).InsertMany(ctx, discountsAsDocument)
	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}
	return getDiscountsFromDB(client)
}

// HandleCreateDiscountsIndex gets called by router
// Calls getDiscountsCollection and handles the context
func HandleCreateDiscountsIndex(context *gin.Context, client *mongo.Client) {
	ctx := DefaultContext()

	indexModel := mongo.IndexModel{Keys: bson.D{{Key: "_tags", Value: "text"}}}
	name, err := getDiscountsCollection(client).Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Created index %s", name)
	context.JSON(200, gin.H{"message": "Created index " + name})
}
