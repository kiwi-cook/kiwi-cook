package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
)

type Discount struct {
	Title          string `json:"title"` // title of the product
	Price          string `json:"price"`
	ImageUrl       string `json:"imageUrl"`
	ValidUntil     int    `json:"validUntil"`
	MarketID       string `json:"internalMarketId"`
	MarketName     string `json:"marketName"`
	MarketLocation string `json:"marketLocation"`
}

type Market struct {
	InternalId            string `json:"id"`
	Distributor           string `json:"distributor"`
	DistributorSpecificID string `json:"distributorSpecificId"`
	Name                  string `json:"name"`
	Location              string `json:"location"`
}

func _Request(url string) []byte {
	// fetch from url
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		log.Fatal(err)
	}

	// set headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0")

	// send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
		return []byte{}
	}

	defer resp.Body.Close()

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}

	return body
}

func GetEdekaMarkets(city string) []Market {
	var body = _Request("https://www.edeka.de/api/marketsearch/markets?searchstring=" + city)

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
	var err = json.Unmarshal(body, &edekaMarketSearch)
	if err != nil {
		log.Fatalln(err)
	}

	// create markets
	var markets []Market
	for _, market := range edekaMarketSearch.Markets {
		markets = append(markets, Market{
			InternalId:            "edeka" + strconv.Itoa(market.ID),
			Distributor:           "edeka",
			DistributorSpecificID: strconv.Itoa(market.ID),
			Name:                  market.Name,
			Location:              market.Contact.Address.City.ZIP + " " + market.Contact.Address.City.Name,
		})
	}
	return markets
}

func GetReweMarkets(city string) []Market {
	var body = _Request("https://www.rewe.de/api/marketsearch?searchTerm=" + city)

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
	var err = json.Unmarshal(body, &reweMarketSearch)
	if err != nil {
		log.Fatalln(err)
	}

	// create markets
	var markets []Market
	for _, market := range reweMarketSearch {
		markets = append(markets, Market{
			InternalId:            "rewe" + market.ID,
			Distributor:           "rewe",
			DistributorSpecificID: market.ID,
			Name:                  market.Name,
			Location:              market.ContactZipCode + " " + market.ContactCity,
		})
	}
	return markets
}

func GetMarkets(city string) []Market {
	var markets []Market
	markets = append(markets, GetEdekaMarkets(city)...)
	markets = append(markets, GetReweMarkets(city)...)
	return markets
}

func GetDiscounts(city string) []Discount {
	var markets = GetMarkets(city)
	var discounts []Discount
	for _, market := range markets {
		discounts = append(discounts, GetDiscountsForMarket(market)...)
	}
	return discounts
}

func GetDiscountsForMarket(market Market) []Discount {
	var discounts []Discount
	switch market.Distributor {
	case "edeka":
		discounts = GetEdekaDiscounts(market)
	case "rewe":
		discounts = GetReweDiscounts(market)
	}
	return discounts
}

func GetReweDiscounts(market Market) []Discount {
	var body = _Request("https://mobile-api.rewe.de/api/v3/all-offers?marketCode=" + market.DistributorSpecificID)

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
			} `json:"offers"`
		} `json:"categories"`
		ValidUntil int `json:"untilDate"`
	}

	var err = json.Unmarshal(body, &reweDiscounts)
	if err != nil {
		log.Fatalln(err)
	}

	// create discounts
	var discounts []Discount
	for _, category := range reweDiscounts.Categories {
		for _, discount := range category.Offers {
			discounts = append(discounts, Discount{
				Price:          discount.PriceData.Price,
				Title:          discount.Title,
				ValidUntil:     reweDiscounts.ValidUntil,
				MarketID:       market.InternalId,
				MarketName:     market.Name,
				MarketLocation: market.Location,
			})
		}
	}
	return discounts
}

func GetEdekaDiscounts(market Market) []Discount {
	var body = _Request("https://www.edeka.de/eh/service/eh/offers?marketId=" + market.DistributorSpecificID)

	// unmarshal json
	var edekaDiscounts struct {
		Docs []struct {
			Price      float64 `json:"preis"` // 0.99
			Title      string  `json:"titel"`
			ImageUrl   string  `json:"bild_app"`
			ValidUntil int     `json:"gueltig_bis"`
		} `json:"docs"`
	}

	var err = json.Unmarshal(body, &edekaDiscounts)
	if err != nil {
		log.Fatalln(err)
	}

	// create discounts
	var discounts []Discount
	for _, discount := range edekaDiscounts.Docs {
		discounts = append(discounts, Discount{
			Price:          strconv.FormatFloat(discount.Price, 'f', -1, 32),
			Title:          discount.Title,
			ImageUrl:       discount.ImageUrl,
			ValidUntil:     discount.ValidUntil,
			MarketID:       market.InternalId,
			MarketName:     market.Name,
			MarketLocation: market.Location,
		})
	}
	return discounts
}
