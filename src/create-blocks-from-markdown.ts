import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { notion } from './client.js'
import { logger } from './logger.js'
import { parseFallback } from './markdown-node-transformers/fallback.js'
import { parseHeading } from './markdown-node-transformers/heading.js'
import { parseParagraph } from './markdown-node-transformers/paragraph.js'

export async function createBlocksFromMarkdown(pageId: string) {
  const markdown = `
  # Main Title
  
  This is a paragraph with some text.
  
  ## Section 1
  
  Another paragraph here.
  
  ### Subsection
  
  More content here.
  
  * This list will be converted to a code block
  * Since we're only handling paragraphs and headings
  `

  logger.debug({ pageId }, 'Parsing markdown..')
  const blocks = markdownToNotion(markdown)
  logger.debug({ pageId }, 'Markdown parsed.')

  logger.debug({ pageId }, 'Appending blocks to page..')
  await notion.blocks.children.append({ block_id: pageId, children: blocks })
  logger.debug({ pageId }, 'Blocks appended.')
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
