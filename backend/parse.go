// Package cmd
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/spf13/cobra"
)

// parseCmd represents the parse command
var parseCmd = &cobra.Command{
	Use:   "parse",
	Short: "Parse a recipe file",
	Long: `The recipe parser is a tool that can parse a JSON file that contains 
one or multiple recipes. The recipe parser then saves the recipes in a database.`,
	Run: func(cmd *cobra.Command, args []string) {
		logLevel, _ := cmd.Flags().GetString("loglevel")

		// Create the TasteBuddyApp
		app := TasteBuddyAppFactory()
		app.SetLogger(logLevel)
		app.Default()

		// Get the file name from the command line
		file, err := cmd.Flags().GetString("file")
		if err != nil || file == "" {
			app.LogError("parseCmd", errors.New("no file specified"))
		}

		// Get the formatter from the command line
		formatter, err := cmd.Flags().GetString("formatter")
		if err != nil || file == "" {
			app.LogError("parseCmd", errors.New("no formatter specified"))
		}

		// Call the parse function
		app.ParseRecipe(file, formatter)
	},
}

func init() {
	rootCmd.AddCommand(parseCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// parseCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	parseCmd.Flags().StringP("file", "f", "", "Specify a JSON file to parse")
	parseCmd.Flags().StringP("formatter", "F", "", "Specify the formatter to use")
	parseCmd.Flags().StringP("loglevel", "l", "default", "Set the log level")
}
