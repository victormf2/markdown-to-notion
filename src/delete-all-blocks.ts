import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client.js'
import { logger } from './logger.js'

export async function deleteAllBlocks(pageId: string) {
  logger.debug({ pageId }, 'Retrieving notion page block..')

  type BlockItem = ListBlockChildrenResponse['results'][number]
  let response: ListBlockChildrenResponse
  const oldBlocks: BlockItem[] = []
  do {
    logger.debug({ pageId }, 'Retrieving a page of blocks..')
    response = await notion.blocks.children.list({ block_id: pageId })
    logger.debug(
      { pageId, numberOfBlocks: response.results.length },
      'Blocks retrieved.',
    )
    oldBlocks.push(...response.results)
  } while (response.has_more)

  logger.debug(
    { pageId, numberOfBlocks: oldBlocks.length },
    'Finished retrieving all page blocks.',
  )

  logger.debug(
    { pageId },
    oldBlocks.length === 0
      ? 'Empty page, no blocks to delete.'
      : 'Deleting all page blocks...',
  )
  for (let i = 0; i < oldBlocks.length; i++) {
    const block = oldBlocks[i]
    logger.debug(
      { pageId, blockIndex: i, blockId: block.id },
      'Deleting block..',
    )
    await notion.blocks.delete({ block_id: block.id })
    logger.debug({ pageId, blockIndex: i, blockId: block.id }, 'Finished.')
  }
  logger.debug({ pageId }, 'Finished deleting all page blocks.')
}
