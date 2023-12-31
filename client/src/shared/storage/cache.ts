/*
 * Copyright (c) 2023 Josef Müller.
 */

import { Drivers, Storage } from '@ionic/storage';
import { logDebug, logError, logWarn } from '@/shared/utils/logging.ts';
import { compress, decompress } from 'lz-string';

const ionicStorage = new Storage({
    name: 'tastebuddy_db', driverOrder: [Drivers.LocalStorage]
});
await ionicStorage.create();

/**
 * Maximum age of the cache in milliseconds
 * @constant 3 days
 */
export const MAX_CACHE_AGE = 1000 * 60 * 60 * 24 * 3

export interface CachedItem<T> {
    value: T | null,
    isOld: boolean
}

/**
 * Cache item in the Ionic Storage and set a timestamp
 * @param key
 * @param value
 */
export async function setCachedItem<T>(key: string, value: T) {
    const tsStart = performance.now()
    logDebug('setCachedItem', key, value)
    if (value === null || typeof value === 'undefined') {
        logWarn('setCachedItem', 'value is null or undefined')
        return value
    }

    const compressedValue = compress(JSON.stringify(value))
    return ionicStorage.set(key, {date: new Date().getTime(), value: compressedValue}).then(() => {
        logDebug('setCachedItem', `saved ${key} to cache`)
        const tsEnd = performance.now()
        logDebug('setCachedItem', `Saved ${key} to cache in ${tsEnd - tsStart}ms`)
        return value
    }).catch((error) => {
        logError('setCachedItem', `error saving ${key} to cache:`, error)
        logDebug('setCachedItem', value)
        return value
    })
}

/**
 * Get the cached item
 * @param key
 * @param defaultValue
 * @param fetch function that is called to fetch the items, if the one in the cache is old
 */
export async function getCachedItem<T>(key: string, defaultValue: T, fetch: (() => Promise<T | null>) | null = null): Promise<CachedItem<T>> {
    logDebug('getCachedItem', `getting ${key} from cache`)
    const tsStart = performance.now()
    return ionicStorage.get(key)
        .then((cachedItem: {
            date: number, value: any
        }) => {
            /* Try to get the cached value */

            // If the value is not in the cache, return the default value
            if (!cachedItem || typeof cachedItem === 'undefined') {
                logWarn(`getCachedItem.${key}`, `no ${key} in cache`)
                return {value: null, isOld: true}
            }

            // ... else, return the cached value
            // Decompress the cached value
            const uncompressedString: string = decompress(cachedItem.value)
            const uncompressedValue: T = JSON.parse(uncompressedString) as T
            const tsEnd = performance.now()
            logDebug(`getCachedItem.${key}`, `loaded ${key} from cache in ${tsEnd - tsStart}ms`)

            // Check if the cached value is old
            const isOld = (new Date().getTime() - cachedItem?.date) > MAX_CACHE_AGE

            return {value: uncompressedValue, isOld: isOld}
        })
        .then(async (cachedItem: CachedItem<T>) => {
            /* Try to fetch the value */

            // If the value cannot call the fetch method, immediately return the cached value
            if (fetch === null || (!cachedItem.isOld && cachedItem.value !== null)) {
                return cachedItem
            }

            logDebug(`getCachedItem.${key}`, `fetching ${key} because cache is invalid`)
            return fetch().then((fetchedItem: T | null) => {
                logDebug(`getCachedItem.${key}`, `fetched ?= null: ${fetchedItem ===
                null}, cached ?= null: ${cachedItem.value === null}, default: ${defaultValue}`)
                return {
                    value: fetchedItem ?? cachedItem.value ?? defaultValue, isOld: false
                }
            })
        })
}