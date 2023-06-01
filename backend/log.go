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

const colorNone = "\033[0m"
const colorRed = "\033[31m"
const colorYellow = "\033[33m"

type TasteBuddyLogger struct {
	logLevel LogLevel
}

func (app *TasteBuddyApp) Log(functionName string, message ...any) {
	app.logger.Log(functionName, message...)
}

// Log prints a simple log message
func (logger *TasteBuddyLogger) Log(functionName string, message ...any) {
	logger.Printf(DefaultLogLevel, "LOG", colorNone, functionName, message...)
}

func (app *TasteBuddyApp) LogDebug(functionName string, message ...any) {
	app.logger.LogDebug(functionName, message...)
}

func (logger *TasteBuddyLogger) LogDebug(functionName string, message ...any) {
	logger.Printf(DebugLogLevel, "DEBUG", colorNone, functionName, message...)
}

func (app *TasteBuddyApp) LogWarning(functionName string, message ...any) {
	app.logger.LogWarning(functionName, message...)
}

// LogWarning prints a warning
func (logger *TasteBuddyLogger) LogWarning(functionName string, message ...any) {
	logger.Printf(WarnLogLevel, "WARNING", colorYellow, functionName, message...)
}

func (app *TasteBuddyApp) LogContextHandle(context *gin.Context, functionName string, message ...any) {
	app.logger.LogContextHandle(context, functionName, message...)
}

// LogContextHandle prints an error message that is caused by the context
func (logger *TasteBuddyLogger) LogContextHandle(context *gin.Context, functionName string, message ...any) {
	logger.Printf(DefaultLogLevel, "LOG "+context.ClientIP(), colorNone, functionName, message...)
}

func (app *TasteBuddyApp) LogError(functionName string, err error) error {
	return app.logger.LogError(functionName, err)
}

// LogError prints an error message
func (logger *TasteBuddyLogger) LogError(functionName string, err error) error {
	logger.Printf(DefaultLogLevel, "ERROR", colorRed, functionName, err)
	return err
}

// FatalError prints an error message and exits the program
func (app *TasteBuddyApp) FatalError(functionName string, err error) {
	app.logger.FatalError(functionName, err)
	app.Exit(1)
}

// FatalError prints an error message and panics
func (logger *TasteBuddyLogger) FatalError(functionName string, err error) {
	logger.Printf(DefaultLogLevel, "FATAL", colorRed, functionName, err)
}

// Printf prints a message if the log level is high enough
func (logger *TasteBuddyLogger) Printf(logLevel LogLevel, logType string, color string, functionName string, message ...any) {
	var format = color + logType + " [" + functionName + "]" + colorNone + ": "
	if len(message) > 0 {
		format += "%v"
	}

	switch logger.logLevel {
	case DefaultLogLevel:
		log.Printf(format, message...)
	case WarnLogLevel:
		if logLevel == WarnLogLevel || logLevel == DefaultLogLevel {
			log.Printf(format, message...)
		}
	case DebugLogLevel:
		if logLevel == DebugLogLevel || logLevel == WarnLogLevel || logLevel == DefaultLogLevel {
			log.Printf(format, message...)
		}
	case VerboseLogLevel:
		log.Printf(format, message...)
	}
}
