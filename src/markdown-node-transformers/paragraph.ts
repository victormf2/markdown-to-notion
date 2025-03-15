import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { Paragraph } from 'mdast'
import { SKIP } from 'unist-util-visit'

export function parseParagraph(node: Paragraph) {
  const text = node.children
    .map((child) => {
      if (child.type === 'text') {
        return child.value
      }

      return 'REDACTED'
    })
    .join('')
    .trim()

  if (!text) {
    return { block: null, visitorResult: SKIP }
  }

  const block: BlockObjectRequest = {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: text },
        },
      ],
    },
  }

  return { block, visitorResult: SKIP }
}
