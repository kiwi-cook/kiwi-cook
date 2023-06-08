// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

// TasteBuddyServer is the web server

type TasteBuddyServer struct {
	port string
	mode ServerMode
	gin  *gin.Engine
	*TasteBuddyApp
}

type ServerMode string

const (
	PROD  = "prod"
	DEV   = "dev"
	ADMIN = "admin"
)

func TasteBuddyServerFactory(app *TasteBuddyApp) *TasteBuddyServer {
	server := &TasteBuddyServer{}
	server.TasteBuddyApp = app
	return server
}

func (server *TasteBuddyServer) SetGin() *TasteBuddyServer {
	gin := gin.Default()
	corsConfig := cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	if server.mode == DEV {
		corsConfig.AllowAllOrigins = false
		corsConfig.AllowOrigins = []string{"http://localhost:8080"}
	}
	gin.Use(cors.New(corsConfig))
	server.gin = gin
	return server
}

// SetPort sets the port for the app
// Return TasteBuddyApp for chaining
func (server *TasteBuddyServer) SetPort(port *string) *TasteBuddyServer {
	if viper.GetString("PORT") != "" && port == nil {
		server.port = viper.GetString("PORT")
	} else if port != nil {
		server.port = *port
	} else {
		// Default port
		server.port = "8081"
	}
	return server
}

// SetMode sets the mode for the app
// Return TasteBuddyApp for chaining
func (server *TasteBuddyServer) SetMode(mode string) *TasteBuddyServer {
	switch mode {
	case "dev":
		// server.SetLogger("debug")
		gin.SetMode(gin.DebugMode)
	case "prod":
		// server.SetLogger("default")
		gin.SetMode(gin.ReleaseMode)
	case "admin":
		// server.SetLogger("debug")
		gin.SetMode(gin.DebugMode)
	default:
		// server.SetLogger("debug")
		gin.SetMode(gin.DebugMode)
	}

	server.mode = ServerMode(mode)

	return server
}

// CheckServerModeMiddleware checks the server mode
func (server *TasteBuddyServer) CheckServerModeMiddleware(serverMode ServerMode) gin.HandlerFunc {
	return func(context *gin.Context) {
		if (server.mode == ADMIN && serverMode == ADMIN) ||
			(server.mode == DEV && (serverMode == PROD || serverMode == DEV)) ||
			(server.mode == PROD && serverMode == PROD) {
			context.Next()
			return
		}
		ForbiddenError(context)
	}
}

// Serve starts the server
func (server *TasteBuddyServer) Serve() {
	////////////////////////////////////////////////////////////////////////
	server.Log("Serve", "Starting Taste-Buddy Server")
	// Finish Initialize App
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up gin
	r := server.gin
	r.Use(server.CheckSessionTokenMiddleware())
	r.Use(server.GenerateJWTMiddleware())

	// API Routes
	apiRoutes := r.Group("/api")

	// Version 1
	v1 := apiRoutes.Group("/v1")
	// Check
	v1.GET("", func(context *gin.Context) {
		context.Status(200)
	})

	////////////////////////////////////////////////////////////////////////
	// Users
	userRoutes := v1.Group("/user")
	// Check session
	userRoutes.GET("/auth", func(context *gin.Context) {
		server.HandleCheckSessionToken(context)
	})
	// Login user
	userRoutes.POST("/auth", func(context *gin.Context) {
		server.HandleBasicAuthentication(context)
	})
	// Register user
	userRoutes.POST("/register", server.CheckServerModeMiddleware(ADMIN), func(context *gin.Context) {
		server.HandleRegisterUser(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Recipes
	recipeRoutes := v1.Group("/recipe")
	// Get list of all recipes
	recipeRoutes.GET("", func(context *gin.Context) {
		server.HandleGetAllRecipes(context)
	})
	// Get recipe by id
	recipeRoutes.GET("/:id", func(context *gin.Context) {
		server.HandleGetRecipeById(context)
	})
	// Delete recipe by id
	recipeRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
		server.HandleDeleteRecipeById(context)
	})
	// Add recipe to database
	recipeRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
		server.HandleAddRecipe(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Items
	itemRoutes := v1.Group("/item")
	// Get list of all items
	itemRoutes.GET("", func(context *gin.Context) {
		server.HandleGetAllItems(context)
	})
	// Get item by id
	itemRoutes.GET("/:id", func(context *gin.Context) {
		server.HandleGetItemById(context)
	})
	// Delete item by id
	itemRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
		server.HandleDeleteItemById(context)
	})
	// Add recipe to database
	itemRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
		server.HandleAddItem(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Suggestions
	suggestionRoutes := v1.Group("/suggest")
	// Suggest recipes
	suggestionRoutes.POST("/recipe", func(context *gin.Context) {
		server.HandleRecipeSuggestions(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	server.Log("Serve", "DONE preparing server")

	// Start server
	if err := server.gin.Run(":" + server.port); err != nil {
		server.LogError("Serve", err)
		return
	}

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}
