import { Client } from '@notionhq/client'
import { ChildPageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { glob } from 'glob'
import { logger } from './logger.js'
import { getAllChildren } from './notion.js'
import { NotionPageMetadata } from './types.js'

export async function getNotionPages(
  notion: Client,
  parentPageId: string,
  filesGlob: string,
) {
  const filePaths = await glob(filesGlob, { withFileTypes: true })
  const children = await getAllChildren(notion, parentPageId)

  const pages = children.filter(
    (block): block is ChildPageBlockObjectResponse => {
      if (!('parent' in block)) {
        return false
      }

      return block.type === 'child_page'
    },
  )

  const pagesMetadata: NotionPageMetadata[] = []
  for (const filePath of filePaths) {
    if (!filePath.isFile()) {
      continue
    }
    logger.info(
      { parentPageId, file: filePath.fullpath() },
      `Getting page for file`,
    )

    const title = getPageTitle(filePath.name)

    const pageId = await getOrCreatePage(notion, parentPageId, title, pages)

    pagesMetadata.push({ pageId, file: filePath.fullpath() })
  }

  return pagesMetadata
}

function getPageTitle(filename: string) {
  const parts = filename.split('.')
  const title = parts.slice(0, parts.length - 1).join('.')
  return title
}

async function getOrCreatePage(
  notion: Client,
  parentPageId: string,
  title: string,
  pages: ChildPageBlockObjectResponse[],
) {
  const foundPage = pages.find((page) => page.child_page.title === title)
  if (foundPage != null) {
    logger.info(
      { parentPageId, pageId: foundPage.id, title },
      'Found page with title',
    )
    return foundPage.id
  }

  logger.info(
    { parentPageId, title },
    'Page not found with title. Creating new page...',
  )

  const response = await notion.pages.create({
    parent: {
      type: 'page_id',
      page_id: parentPageId,
    },
    properties: {
      title: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: title,
            },
          },
        ],
      },
    },
  })

  logger.info({ parentPageId, title, pageId: response.id }, 'Page created.')

  return response.id
}
