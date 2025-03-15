import { APIErrorCode, isNotionClientError } from '@notionhq/client'
import { setTimeout } from 'timers/promises'
import { logger } from './logger.js'

const DEFAULT_ERROR = new Error('something went wrong')

export async function retryRateLimit(fn: () => Promise<void>) {
  const maxAttempts = 5
  let lastError = DEFAULT_ERROR
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await fn()
      return
    } catch (error) {
      if (
        !isNotionClientError(error) ||
        (error.code !== APIErrorCode.ConflictError &&
          error.code !== APIErrorCode.RateLimited)
      ) {
        throw error
      }

      lastError = error

      logger.warn(
        { code: error.code, status: error.status, name: error.name },
        'Something went wrong, will retry: ' + error.message,
      )

      await setTimeout(1000)
    }
  }

  logger.warn({}, 'That was the last attempt')

  throw lastError
}
