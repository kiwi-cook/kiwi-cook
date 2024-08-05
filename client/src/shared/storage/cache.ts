/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

import { Drivers, Storage } from '@ionic/storage';
import { logDebug, logError, logWarn } from '@/shared/utils/logging.ts';
import { compress, decompress } from 'lz-string';

const MODULE = 'shared.storage.cache.'

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
    const fName = MODULE + 'setCachedItem'

    const tsStart = performance.now()
    logDebug(fName, key, value)
    if (value === null || typeof value === 'undefined') {
        logWarn(fName, 'value is null or undefined')
        return value
    }

    const compressedValue = compress(JSON.stringify(value))
    return ionicStorage.set(key, { date: new Date().getTime(), value: compressedValue }).then(() => {
        logDebug(fName, `saved ${key} to cache`)
        const tsEnd = performance.now()
        logDebug(fName, `Saved ${key} to cache in ${tsEnd - tsStart}ms`)
        return value
    }).catch((error) => {
        logError(fName, `error saving ${key} to cache:`, error)
        logDebug(fName, value)
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
    const fName = MODULE + 'getCachedItem.' + key

    logDebug(fName, `getting ${key} from cache`)
    const tsStart = performance.now()
    return ionicStorage.get(key)
        .then((cachedItem: {
            date: number, value: any
        }) => {
            /* Try to get the cached value */

            // If the value is not in the cache, return the default value
            if (!cachedItem || typeof cachedItem === 'undefined' ||
                (Array.isArray(cachedItem) && cachedItem.length === 0)) {
                logWarn(fName, `no ${key} in cache`)
                return { value: null, isOld: true }
            }

            // ... else, return the cached value
            // Decompress the cached value
            const uncompressedString: string = decompress(cachedItem.value)
            const uncompressedValue: T = JSON.parse(uncompressedString) as T
            const tsEnd = performance.now()
            logDebug(fName, `loaded ${key} from cache in ${tsEnd - tsStart}ms`)

            // Check if the cached value is old
            const isOld = (new Date().getTime() - cachedItem?.date) > MAX_CACHE_AGE
            logDebug(fName, `isOld: ${isOld}`)

            return { value: uncompressedValue, isOld: isOld }
        })
        .then(async (cachedItem: CachedItem<T>) => {
            /* Try to fetch the value */

            // If the value cannot call the fetch method, immediately return the cached value
            if (fetch === null || (!cachedItem.isOld && cachedItem.value !== null && Array.isArray(cachedItem.value) &&
                cachedItem.value.length > 0)) {
                return cachedItem
            }

            logDebug(fName, `fetching ${key} because cache is invalid`)
            return fetch().then((fetchedItem: T | null) => {
                logDebug(fName, `fetched ?= null: ${fetchedItem === null}, cached ?= null: ${cachedItem.value ===
                null}, default: ${defaultValue}`)
                return {
                    value: fetchedItem ?? cachedItem.value ?? defaultValue, isOld: false
                }
            })
        })
}

/**
 * Remove the cached item
 * @param key
 */
export async function removeCachedItem(key: string) {
    logDebug(MODULE + 'removeCachedItem.' + key, `removing ${key} from cache`)
    return ionicStorage.remove(key)
}
