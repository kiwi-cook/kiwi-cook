package main

import (
	"encoding/json"
	"log"
)

// Get the REWE markets for a city
func getReweMarkets(city string) ([]Market, error) {
	body, err := GetFromUrl("https://www.rewe.de/api/marketsearch?searchTerm=" + city)
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

// Get the discounts for a REWE market
func getReweDiscounts(market Market) ([]Discount, error) {
	body, err := GetFromUrl("https://mobile-api.rewe.de/api/v3/all-offers?marketCode=" + market.DistributorSpecificMarketID)
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
				InternalMarketID: market.ID.Hex(),
				Tags:             []string{category.Title, discount.SubTitle, market.Distributor, market.Location.City},
			})
		}
	}
	return discounts, nil
}
