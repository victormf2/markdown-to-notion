import { APIErrorCode, Client, isNotionClientError } from '@notionhq/client'
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints.js'
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

export async function getAllChildren(notion: Client, blockId: string) {
  type BlockItem = ListBlockChildrenResponse['results'][number]
  let response: ListBlockChildrenResponse
  const blocks: BlockItem[] = []
  do {
    logger.info({ blockId }, 'Retrieving children..')
    response = await notion.blocks.children.list({ block_id: blockId })
    logger.info(
      { blockId, numberOfBlocks: response.results.length },
      'Blocks retrieved.',
    )
    blocks.push(...response.results)
  } while (response.has_more)

  logger.info(
    { blockId, numberOfBlocks: blocks.length },
    'Finished retrieving all page blocks.',
  )

  return blocks
}
