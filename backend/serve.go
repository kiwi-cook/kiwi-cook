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
		app := TasteBuddyAppFactory()

		// Get the port from the command line
		port, _ := cmd.Flags().GetString("port")
		server := TasteBuddyServerFactory(app)
		server.SetPort(&port)
		server.Serve()
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
	serveCmd.Flags().StringP("loglevel", "l", "", "Set the database connection string")
}
