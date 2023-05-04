package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

type LogLevel string

const (
	DefaultLogLevel LogLevel = "default" // Normal logging
	WarnLogLevel    LogLevel = "warn"    // Warning logging
	DebugLogLevel   LogLevel = "debug"   // Debug logging
	VerboseLogLevel LogLevel = "verbose" // Verbose logging. Logs everything
)

// Log prints a simple log message
func (app *TasteBuddyApp) Log(functionName string, message ...any) {
	if len(message) == 0 {
		app.Printf(DefaultLogLevel, "INFO [%s]", functionName)
		return
	} else if len(message) == 1 {
		app.Printf(DefaultLogLevel, "INFO [%s]: %v", functionName, message[0])
		return
	}
	app.Printf(DefaultLogLevel, "INFO [%s]: %s", functionName, message)
}

func (app *TasteBuddyApp) LogDebug(functionName string, message ...any) {
	if len(message) == 0 {
		app.Printf(DebugLogLevel, "DEBUG [%s]", functionName)
		return
	} else if len(message) == 1 {
		app.Printf(DebugLogLevel, "DEBUG [%s]: %v", functionName, message[0])
		return
	}
	app.Printf(DebugLogLevel, "DEBUG [%s]: %s", functionName, message)
}

// LogWarning prints a warning
func (app *TasteBuddyApp) LogWarning(functionName string, message ...any) {
	const colorYellow = "\033[0;33m"
	const colorNone = "\033[0m"

	if len(message) == 0 {
		app.Printf(WarnLogLevel, "%sWARNING%s [%s]", colorYellow, colorNone, functionName)
		return
	} else if len(message) == 1 {
		app.Printf(WarnLogLevel, "%sWARNING%s [%s]: %v", colorYellow, colorNone, functionName, message[0])
		return
	}
	app.Printf(WarnLogLevel, "%sWARNING%s [%s]: %s", colorYellow, colorNone, functionName, message)
}

// LogContextHandle prints an error message that is caused by the context
func (app *TasteBuddyApp) LogContextHandle(context *gin.Context, functionName string, message ...any) {
	const colorBlue = "\033[0;34m"
	const colorNone = "\033[0m"

	app.Printf(DefaultLogLevel, "%sHANDLE IP(%s)%s [%s]: %s", colorBlue, context.ClientIP(), colorNone, functionName, message)
}

// LogError prints an error message
func (app *TasteBuddyApp) LogError(functionName string, err error) error {
	const colorRed = "\033[0;31m"
	const colorNone = "\033[0m"

	app.Printf(DefaultLogLevel, "%sERROR%s [%s]: %s", colorRed, colorNone, functionName, err)
	return err
}

// FatalError prints an error message and panics
func (app *TasteBuddyApp) FatalError(functionName string, err error) {
	const colorRed = "\033[0;31m"
	const colorNone = "\033[0m"
	app.Printf(DefaultLogLevel, "%sFATAL ERROR%s [%s]: %s", colorRed, colorNone, functionName, err)
	panic("FATAL ERROR")
}

// Printf prints a message if the log level is high enough
func (app *TasteBuddyApp) Printf(logLevel LogLevel, format string, v ...any) {
	if logLevel <= app.logLevel {
		log.Printf(format, v...)
	}
}
