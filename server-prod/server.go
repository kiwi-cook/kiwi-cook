// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
)

// TasteBuddyServer is the web server

type TasteBuddyServer struct {
	port  string
	mode  ServerMode
	fiber *fiber.App
	*TasteBuddyApp
}

type ServerMode string

func TasteBuddyServerFactory(app *TasteBuddyApp) *TasteBuddyServer {
	server := &TasteBuddyServer{}
	server.TasteBuddyApp = app
	return server
}

func (server *TasteBuddyServer) SetFiber() *TasteBuddyServer {
	config := fiber.Config{
		AppName:               "Taste Buddy",
		DisableStartupMessage: true,
	}
	f := fiber.New(config)

	f.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:8080, http://localhost:8081, http://localhost:8082, https://taste-buddy.github.io",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET",
	}))

	f.Use(compress.New(compress.Config{
		Level: compress.LevelBestCompression,
	}))

	server.fiber = f
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
	server.mode = ServerMode(mode)
	return server
}

// Serve starts the server
func (server *TasteBuddyServer) Serve() {
	////////////////////////////////////////////////////////////////////////
	server.Log("Serve", "Starting Taste-Buddy Server")
	// Finish Initialize App
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up fiber
	r := server.fiber

	// API Routes
	apiRoutes := r.Group("/")

	// Check
	apiRoutes.Get("", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).SendString("Hello from Taste Buddy!\nThe Student-Friendly Recipe Suggestion App: Crafted by Students, for Students")
	})

	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Recipes
	apiRoutes.Get("/recipe", func(context *fiber.Ctx) error {
		// Get list of all recipes
		return server.HandleGetRecipes(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Items
	apiRoutes.Get("/item", func(context *fiber.Ctx) error {
		// Get list of all items
		return server.HandleGetItems(context)
	})
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Catch all
	apiRoutes.Get("*", func(context *fiber.Ctx) error {
		return NotFoundError(context)
	})

	////////////////////////////////////////////////////////////////////////
	server.Log("Serve", "DONE preparing server")

	// Start server
	if err := server.fiber.Listen(":" + server.port); err != nil {
		server.LogError("Serve", err)
	}

	// Finish fiber
	////////////////////////////////////////////////////////////////////////
}
