import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { RootContent } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { SKIP } from 'unist-util-visit'

export function parseFallback(node: RootContent) {
  // Convert any other content into a code block
  const content = toMarkdown(node)
  const block: BlockObjectRequest = {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [
        {
          type: 'text',
          text: { content },
        },
      ],
      language: 'markdown',
    },
  }

  return { block, visitorResult: SKIP }
}
