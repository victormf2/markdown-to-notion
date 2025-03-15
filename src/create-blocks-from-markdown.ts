import { Client } from '@notionhq/client'
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { readFile } from 'node:fs/promises'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { logger } from './logger.js'
import { parseFallback } from './markdown-node-transformers/fallback.js'
import { parseHeading } from './markdown-node-transformers/heading.js'
import { parseParagraph } from './markdown-node-transformers/paragraph.js'
import { NotionPageMetadata } from './types.js'

export async function createBlocksFromMarkdown(
  notion: Client,
  notionPage: NotionPageMetadata,
) {
  const { pageId, file } = notionPage

  const markdown = await readFile(file, { encoding: 'utf-8' })

  logger.info({ pageId }, 'Parsing markdown..')
  const blocks = markdownToNotion(markdown)
  logger.info({ pageId }, 'Markdown parsed.')

  logger.info({ pageId }, 'Appending blocks to page..')
  await notion.blocks.children.append({ block_id: pageId, children: blocks })
  logger.info({ pageId }, 'Blocks appended.')
}

function markdownToNotion(markdown: string): BlockObjectRequest[] {
  const processor = unified().use(remarkParse)
  const ast = processor.parse(markdown)
  const blocks: BlockObjectRequest[] = []

  // Traverse the AST and convert nodes to Notion blocks
  visit(ast, (node) => {
    if (node.type === 'heading') {
      const { block, visitorResult } = parseHeading(node)

      blocks.push(block)
      return visitorResult
    } else if (node.type === 'paragraph') {
      const { block, visitorResult } = parseParagraph(node)

      if (block != null) {
        blocks.push(block)
      }
      return visitorResult
    } else if (node.type !== 'root') {
      const { block, visitorResult } = parseFallback(node)

      blocks.push(block)
      return visitorResult
    }
  })

  return blocks
}
