// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Query struct {
	User struct {
		UserID   primitive.ObjectID `json:"id,omitempty"`
		Location struct {
			Latitude  float64 `json:"latitude,omitempty"`
			Longitude float64 `json:"longitude,omitempty"`
		}
	} `json:"user,omitempty"`
	Items []struct {
		ItemID  primitive.ObjectID `json:"id,omitempty"`
		Name    string             `json:"name,omitempty"`
		Exclude bool               `json:"exclude,omitempty"`
	} `json:"items,omitempty"`
	Recipes []struct {
		RecipeID primitive.ObjectID `json:"id,omitempty"`
		Exclude  bool               `json:"exclude,omitempty"`
	}
}

type QueryResult struct {
	Recipe []Recipe `json:"recipe,omitempty"`
	Item   []Item   `json:"item,omitempty"`
}

// HandleRecommendation gets called by router
// Calls suggestRecipes and handles the context
func (server *TasteBuddyServer) HandleRecommendation(context *gin.Context) {
	var query Query
	if err := context.ShouldBindJSON(&query); err != nil {
		server.LogError("HandleRecommendation", err)
		BadRequestError(context, "Invalid query")
		return
	}

	// recommend recipes

	Success(context, QueryResult{})
}
