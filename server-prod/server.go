// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gofiber/fiber/v2"
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
		GETOnly:               true,
	}
	app := fiber.New(config)

	server.fiber = app
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
		return c.Status(fiber.StatusOK).SendString("Hello from Taste Buddy 🍻")
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

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}
