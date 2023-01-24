package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Discount struct {
	ID               string `json:"_id,omitempty" bson:"_id,omitempty"` // id of the product
	Title            string `json:"title" bson:"title"`                 // title of the product
	Price            string `json:"price" bson:"price"`                 // price of the product
	ImageUrl         string `json:"imageUrl" bson:"imageUrl"`
	ValidUntil       int    `json:"validUntil" bson:"validUntil"` // unix timestamp
	MarketName       string `json:"marketName" bson:"marketName"`
	InternalMarketID string `json:"internalMarketId" bson:"internalMarketId"`
	MarketLocation   string `json:"-" bson:"_marketLocation"`
}

type Coordinates struct {
	Latitude  float64 `json:"lat,omitempty" bson:"lat,omitempty"`
	Longitude float64 `json:"lon,omitempty" bson:"lon,omitempty"`
}

type MarketLocation struct {
	Coordinates Coordinates `json:"coordinates,omitempty" bson:"coordinates,omitempty"`
	City        string      `json:"city" bson:"city"`
	Street      string      `json:"street" bson:"street"`
	ZipCode     string      `json:"zipCode" bson:"zipCode"`
}

type Market struct {
	ID                          string         `json:"_id,omitempty" bson:"_id,omitempty"`
	Distributor                 string         `json:"dist" bson:"dist"`
	DistributorSpecificMarketID string         `json:"distMarketId" bson:"distMarketId"`
	MarketName                  string         `json:"name" bson:"name"`
	Location                    MarketLocation `json:"location,omitempty" bson:"location,omitempty"`
}

func request(url string) ([]byte, error) {
	// fetch from url
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	// set headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0")

	// send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	defer resp.Body.Close()

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Print(err)
		return []byte{}, err
	}

	return body, nil
}

// Gets the EDEKA markets for a city
func getEdekaMarkets(city string) ([]Market, error) {
	body, err := request("https://www.edeka.de/api/marketsearch/markets?searchstring=" + city)
	if err != nil {
		return []Market{}, err
	}

	// EdekaMarketSearch is the response from the EDEKA api
	type EdekaMarketSearch struct {
		TotalCount int `json:"totalCount"`
		Markets    []struct {
			ID      int    `json:"id"`
			Name    string `json:"name"`
			Contact struct {
				Address struct {
					City struct {
						Name string `json:"name"`
						ZIP  string `json:"zipCode"`
					}
					Street string `json:"street"`
				} `json:"address"`
			} `json:"contact"`
			Coordinates struct {
				Latitude  string `json:"lat"`
				Longitude string `json:"lon"`
			} `json:"coordinates"`
		} `json:"markets"`
	}

	// unmarshal json
	var edekaMarketSearch EdekaMarketSearch
	err = json.Unmarshal(body, &edekaMarketSearch)
	if err != nil {
		log.Print(err)
		return []Market{}, err
	}

	// create markets
	var markets []Market
	for _, market := range edekaMarketSearch.Markets {
		// parse coordinates
		lat, err := strconv.ParseFloat(market.Coordinates.Latitude, 8)
		if err != nil {
			log.Print(err)
			lat = 0
		}

		lon, err := strconv.ParseFloat(market.Coordinates.Longitude, 8)
		if err != nil {
			log.Print(err)
			lon = 0
		}

		markets = append(markets, Market{
			Distributor:                 "edeka",
			DistributorSpecificMarketID: strconv.Itoa(market.ID),
			MarketName:                  market.Name,
			Location: MarketLocation{
				Coordinates: Coordinates{
					Latitude:  lat,
					Longitude: lon,
				},
				City:    city,
				Street:  market.Contact.Address.Street,
				ZipCode: market.Contact.Address.City.ZIP,
			},
		})
	}
	return markets, nil
}

// Gets the REWE markets for a city
func getReweMarkets(city string) ([]Market, error) {
	body, err := request("https://www.rewe.de/api/marketsearch?searchTerm=" + city)
	if err != nil {
		return []Market{}, err
	}

	// ReweMarketSearch is the response from the REWE api
	type ReweMarketSearch struct {
		ID             string `json:"wwIdent"`
		Name           string `json:"marketHeadline"`
		ContactStreet  string `json:"contactStreet"`
		ContactZipCode string `json:"contactZipCode"`
		ContactCity    string `json:"contactCity"`
	}

	// unmarshal json
	var reweMarketSearch []ReweMarketSearch
	err = json.Unmarshal(body, &reweMarketSearch)
	if err != nil {
		log.Print(err)
		return []Market{}, err
	}

	// create markets
	var markets []Market
	for _, market := range reweMarketSearch {
		markets = append(markets, Market{
			Distributor:                 "rewe",
			DistributorSpecificMarketID: market.ID,
			MarketName:                  market.Name,
			Location: MarketLocation{
				City:    market.ContactCity,
				Street:  market.ContactStreet,
				ZipCode: market.ContactZipCode,
			},
		})
	}
	return markets, nil
}

// HandleGetMarkets gets called by router
// Calls getMarkets and handles the context
func HandleGetMarkets(context *gin.Context) {
	city := context.Param("city")
	context.JSON(200, getMarkets(city))
}

// Gets all markets for a city
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

// Gets the discounts for a REWE market
func getReweDiscounts(market Market) ([]Discount, error) {
	body, err := request("https://mobile-api.rewe.de/api/v3/all-offers?marketCode=" + market.DistributorSpecificMarketID)
	if err != nil {
		return []Discount{}, err
	}

	// unmarshal json
	var reweDiscounts struct {
		Categories []struct {
			Title  string `json:"title"`
			Offers []struct {
				CellType  string `json:"cellType"`
				Title     string `json:"title"`
				SubTitle  string `json:"subTitle"`
				PriceData struct {
					Price string `json:"price"`
				} `json:"priceData"`
				Images []string `json:"images" bson:"images"`
			} `json:"offers"`
		} `json:"categories"`
		ValidUntil int `json:"untilDate"`
	}

	err = json.Unmarshal(body, &reweDiscounts)
	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}

	// create discounts
	var discounts []Discount
	for _, category := range reweDiscounts.Categories {
		for _, discount := range category.Offers {
			// image url can be empty
			imageUrl := ""
			if len(discount.Images) > 0 {
				imageUrl = discount.Images[0]
			}

			discounts = append(discounts, Discount{
				Price:            discount.PriceData.Price,
				Title:            discount.Title,
				ImageUrl:         imageUrl,
				ValidUntil:       reweDiscounts.ValidUntil,
				MarketName:       market.MarketName,
				InternalMarketID: market.ID,
				MarketLocation:   market.Location.City,
			})
		}
	}
	return discounts, nil
}

func getEdekaDiscounts(market Market) ([]Discount, error) {
	body, err := request("https://www.edeka.de/eh/service/eh/offers?marketId=" + market.DistributorSpecificMarketID)
	if err != nil {
		return []Discount{}, err
	}

	// unmarshal json
	var edekaDiscounts struct {
		Docs []struct {
			Price      float64 `json:"preis"` // 0.99
			Title      string  `json:"titel"`
			ImageUrl   string  `json:"bild_app"`
			ValidUntil int     `json:"gueltig_bis"`
		} `json:"docs"`
	}

	err = json.Unmarshal(body, &edekaDiscounts)
	if err != nil {
		log.Print(err)
		return []Discount{}, err
	}

	// create discounts
	var discounts []Discount
	for _, discount := range edekaDiscounts.Docs {
		discounts = append(discounts, Discount{
			Price:            strconv.FormatFloat(discount.Price, 'f', -1, 32),
			Title:            discount.Title,
			ImageUrl:         discount.ImageUrl,
			ValidUntil:       discount.ValidUntil,
			MarketName:       market.MarketName,
			InternalMarketID: market.ID,
			MarketLocation:   market.Location.City,
		})
	}
	return discounts, nil
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

// Gets discounts from database or API
func getDiscountsFromDBOrAPI(client *mongo.Client, city string) ([]Discount, error) {
	ctx := DefaultContext()

	// check if discounts are in database
	log.Printf("Check if discounts for city %s are in database.", city)
	var discountsFromDB, _ = getDiscountsCollection(client).Find(ctx, bson.D{{Key: "$text", Value: bson.D{{Key: "$search", Value: city}}}})

	// get discounts from database
	var discounts []Discount
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

// Gets all discounts for a market from the market's API
func getDiscountsForMarket(market Market) ([]Discount, error) {
	switch market.Distributor {
	case "edeka":
		return getEdekaDiscounts(market)
	case "rewe":
		return getReweDiscounts(market)
	}
	return []Discount{}, nil
}

// Gets all discounts for a city from the market's APIs
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

// Gets discounts from database
func getDiscountsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("discounts")
}

// Gets all discounts from database
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

	indexModel := mongo.IndexModel{Keys: bson.D{{Key: "_marketLocation", Value: "text"}}}
	name, err := getDiscountsCollection(client).Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Created index %s", name)
	context.JSON(200, gin.H{"message": "Created index " + name})
}
