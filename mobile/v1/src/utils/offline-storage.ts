/**
 * @file Offline Storage Service
 * @description Provides persistent storage for offline data caching
 * @module utils/offline-storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number | null // null means no expiry
  version: string
}

/**
 * Cache options for storing data
 */
interface CacheOptions {
  /** Time in milliseconds until entry expires (null for no expiry) */
  expiry?: number | null
  /** Version tag for cache invalidation */
  version?: string
}

/**
 * Default cache options
 */
const DEFAULT_OPTIONS: CacheOptions = {
  expiry: 24 * 60 * 60 * 1000, // 24 hours
  version: "1.0",
}

/**
 * @class OfflineStorageService
 * @description Manages persistent storage for offline data with expiry and versioning
 */
class OfflineStorageService {
  private readonly PREFIX = "offline_cache:"
  private readonly QUEUE_KEY = "offline_request_queue"
  private readonly TOKEN_CACHE_KEY = "offline_token_cache"

  /**
   * Store data in cache with metadata
   * @param key - Unique identifier for the cached data
   * @param data - Data to cache
   * @param options - Cache options
   */
  public async setItem<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options }
      const cacheKey = this.getCacheKey(key)

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: opts.expiry ? Date.now() + opts.expiry : null,
        version: opts.version || DEFAULT_OPTIONS.version!,
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry))

      // TODO: Remove detailed logging before production
      console.log(`📦 CACHE: Stored data for key "${key}"`)
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error(`📦 CACHE: Error storing data for key "${key}":`, error)
      throw new Error(`Failed to store offline data: ${error}`)
    }
  }

  /**
   * Retrieve data from cache if valid
   * @param key - Unique identifier for the cached data
   * @param options - Options to validate the cache entry
   * @returns The cached data or null if not found/invalid
   */
  public async getItem<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key)
      const data = await AsyncStorage.getItem(cacheKey)

      if (!data) {
        return null
      }

      const entry = JSON.parse(data) as CacheEntry<T>
      const opts = { ...DEFAULT_OPTIONS, ...options }

      // Check version
      if (entry.version !== opts.version) {
        // TODO: Remove detailed logging before production
        console.log(`📦 CACHE: Version mismatch for key "${key}" (${entry.version} vs ${opts.version})`)
        return null
      }

      // Check expiry
      if (entry.expiry && entry.expiry < Date.now()) {
        // TODO: Remove detailed logging before production
        console.log(`📦 CACHE: Data expired for key "${key}"`)
        await this.removeItem(key)
        return null
      }

      // TODO: Remove detailed logging before production
      console.log(`📦 CACHE: Retrieved data for key "${key}"`)
      return entry.data
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error(`📦 CACHE: Error retrieving data for key "${key}":`, error)
      return null
    }
  }

  /**
   * Remove item from cache
   * @param key - Unique identifier for the cached data
   */
  public async removeItem(key: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key)
      await AsyncStorage.removeItem(cacheKey)

      // TODO: Remove detailed logging before production
      console.log(`📦 CACHE: Removed data for key "${key}"`)
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error(`📦 CACHE: Error removing data for key "${key}":`, error)
    }
  }

  /**
   * Check if item exists in cache and is valid
   * @param key - Unique identifier for the cached data
   * @param options - Options to validate the cache entry
   * @returns Whether valid data exists
   */
  public async hasValidItem(key: string, options?: CacheOptions): Promise<boolean> {
    const data = await this.getItem(key, options)
    return data !== null
  }

  /**
   * Get cache entry metadata without retrieving full data
   * @param key - Unique identifier for the cached data
   * @returns Metadata about the cache entry or null if not found
   */
  public async getMetadata(key: string): Promise<Omit<CacheEntry<null>, "data"> | null> {
    try {
      const cacheKey = this.getCacheKey(key)
      const data = await AsyncStorage.getItem(cacheKey)

      if (!data) {
        return null
      }

      const entry = JSON.parse(data) as CacheEntry<any>
      const { data: _, ...metadata } = entry

      return metadata
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error(`📦 CACHE: Error getting metadata for key "${key}":`, error)
      return null
    }
  }

  /**
   * Clear all cached data
   */
  public async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter((key) => key.startsWith(this.PREFIX))

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys)
      }

      // TODO: Remove detailed logging before production
      console.log(`📦 CACHE: Cleared all cached data (${cacheKeys.length} items)`)
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("📦 CACHE: Error clearing all cached data:", error)
      throw new Error(`Failed to clear offline cache: ${error}`)
    }
  }

  /**
   * Cache token data for offline use
   * @param tokenData - Token data to cache
   */
  public async cacheTokenData(tokenData: { token: string; refreshToken?: string; expiry?: number }): Promise<void> {
    await this.setItem(
      this.TOKEN_CACHE_KEY,
      {
        ...tokenData,
        cachedAt: Date.now(),
      },
      {
        // Token cache doesn't expire automatically - we'll validate it separately
        expiry: null,
      },
    )
  }

  /**
   * Get cached token data
   * @returns Cached token data or null if not found
   */
  public async getCachedTokenData(): Promise<{
    token: string
    refreshToken?: string
    expiry?: number
    cachedAt: number
  } | null> {
    return this.getItem(this.TOKEN_CACHE_KEY)
  }

  /**
   * Generate prefixed cache key
   * @private
   * @param key - Original key
   * @returns Prefixed cache key
   */
  private getCacheKey(key: string): string {
    return `${this.PREFIX}${key}`
  }
}

export const offlineStorage = new OfflineStorageService()