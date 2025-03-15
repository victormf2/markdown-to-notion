import { Client } from '@notionhq/client'
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints'
import { logger } from './logger.js'
import { retryRateLimit } from './notion.js'

export async function deleteAllBlocks(notion: Client, pageId: string) {
  logger.info({ pageId }, 'Retrieving notion page block..')

  type BlockItem = ListBlockChildrenResponse['results'][number]
  let response: ListBlockChildrenResponse
  const oldBlocks: BlockItem[] = []
  do {
    logger.info({ pageId }, 'Retrieving a page of blocks..')
    response = await notion.blocks.children.list({ block_id: pageId })
    logger.info(
      { pageId, numberOfBlocks: response.results.length },
      'Blocks retrieved.',
    )
    oldBlocks.push(...response.results)
  } while (response.has_more)

  logger.info(
    { pageId, numberOfBlocks: oldBlocks.length },
    'Finished retrieving all page blocks.',
  )

  logger.info(
    { pageId },
    oldBlocks.length === 0
      ? 'Empty page, no blocks to delete.'
      : 'Deleting all page blocks...',
  )

  for (const block of oldBlocks) {
    await retryRateLimit(async () => {
      logger.info({ pageId, blockId: block.id }, 'Deleting block..')
      await notion.blocks.delete({ block_id: block.id })
      logger.info({ pageId, blockId: block.id }, 'Block deleted.')
    })
  }

  logger.info({ pageId }, 'Finished deleting all page blocks.')
}
