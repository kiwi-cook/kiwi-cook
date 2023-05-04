// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"encoding/json"
	"strconv"
)

// GetEdekaMarkets returns all EDEKA markets for a city
func (app *TasteBuddyApp) GetEdekaMarkets(city string) ([]Market, error) {
	body, err := app.GetFromUrl("https://www.edeka.de/api/marketsearch/markets?searchstring=" + city)
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
	if err = json.Unmarshal(body, &edekaMarketSearch); err != nil {
		return []Market{}, app.LogError("GetEdekaMarkets", err)
	}

	// create markets
	var markets []Market
	for _, market := range edekaMarketSearch.Markets {
		// parse coordinates
		lat, err := strconv.ParseFloat(market.Coordinates.Latitude, 32)
		if err != nil {
			app.LogError("GetEdekaMarkets", err)
			lat = 0
		}

		lon, err := strconv.ParseFloat(market.Coordinates.Longitude, 32)
		if err != nil {
			app.LogError("GetEdekaMarkets", err)
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

func (app *TasteBuddyApp) GetEdekaDiscounts(market Market) ([]Discount, error) {
	body, err := app.GetFromUrl("https://www.edeka.de/eh/service/eh/offers?marketId=" + market.DistributorSpecificMarketID)
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

	if err = json.Unmarshal(body, &edekaDiscounts); err != nil {
		return []Discount{}, app.LogError("GetEdekaDiscounts", err)
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
			InternalMarketID: market.ID.Hex(),
			Tags:             []string{market.Distributor, market.Location.City},
		})
	}
	return discounts, nil
}
