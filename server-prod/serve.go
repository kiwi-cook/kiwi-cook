// Package cmd
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/spf13/cobra"
)

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Run the web server",
	Run: func(cmd *cobra.Command, args []string) {
		port, _ := cmd.Flags().GetString("port")
		logLevel, _ := cmd.Flags().GetString("loglevel")
		mode, _ := cmd.Flags().GetString("mode")

		// Create the TasteBuddyApp
		app := TasteBuddyAppFactory()
		app.Default()
		app.SetLogger(logLevel)

		// Create the server
		TasteBuddyServerFactory(app).
			SetPort(&port).
			SetMode(mode).
			SetFiber().
			Serve()
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// serveCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	serveCmd.Flags().StringP("port", "p", "8081", "Set the port to use")
	serveCmd.Flags().StringP("loglevel", "l", "default", "Set the log level")
	serveCmd.Flags().StringP("mode", "m", "prod", "Set the mode")
	serveCmd.Flags().StringP("config", "c", "", "Set the config file")
}
