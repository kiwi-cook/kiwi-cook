package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
)

type Discount struct {
	Price        string `json:"price"`
	DiscountType string `json:"discountType"`
	Market       string `json:"marketId"`
}

type Market struct {
	InternalId            string `json:"id"`
	Distributor           string `json:"distributor"`
	DistributorSpecificID string `json:"distributorSpecificId"`
	Name                  string `json:"name"`
	Location              string `json:"location"`
}

// EdekaMarketSearch is the response from the edeka api
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

func GetEdekaMarkets(city string) []Market {
	var edekaMarketSearchURL = "https://www.edeka.de/api/marketsearch/markets?searchstring="

	// fetch markets from edeka api
	req, err := http.NewRequest(http.MethodGet, edekaMarketSearchURL+city, nil)
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
		return []Market{}
	}

	defer resp.Body.Close()

	// read bytes from body
	body, err := io.ReadAll(resp.Body)
	// b, err := ioutil.ReadAll(resp.Body)  Go.1.15 and earlier
	if err != nil {
		log.Fatalln(err)
	}

	// unmarshal json
	var edekaMarketSearch EdekaMarketSearch
	err = json.Unmarshal(body, &edekaMarketSearch)
	if err != nil {
		log.Fatalln(err)
	}

	// create markets
	var markets []Market
	for index, market := range edekaMarketSearch.Markets {
		markets = append(markets, Market{
			InternalId:            strconv.Itoa(index),
			Distributor:           "edeka",
			DistributorSpecificID: strconv.Itoa(market.ID),
			Name:                  market.Name,
			Location:              market.Contact.Address.City.ZIP + " " + market.Contact.Address.City.Name,
		})
	}
	return markets
}
