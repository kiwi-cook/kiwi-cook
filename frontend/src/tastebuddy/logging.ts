import {RouteLocationNormalized} from "vue-router";

/**
 * Log a message to the console
 * @param functionName the name of the function
 * @param message the message to log
 */
export const log = (functionName: string, message?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${functionName}]:`, message)
    }
}
/**
 * Debug a message to the console
 * @param functionName the name of the function
 * @param message the message to log
 * @param messages
 */
export const logDebug = (functionName: string, message: any, ...messages: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[${functionName}]:`, message, ...messages)
    }
}

/**
 * Log an error to the console
 * @param functionName the name of the function that threw the error
 * @param error the error to log
 * @param errors
 */
export const logError = (functionName: string, error: any, ...errors: any[]) => {
    if (error instanceof Error) {
        console.error(`[${functionName}]: ${error.message}`)
    } else {
        console.error(`[${functionName}]:`, error, ...errors)
    }
}

export const beforeEachLog = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    logDebug('middleware.router', `routing from ${from.path} => ${to.path}`)
}