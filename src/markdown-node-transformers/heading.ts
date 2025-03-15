import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { Heading } from 'mdast'
import { SKIP } from 'unist-util-visit'

export function parseHeading(node: Heading) {
  const text = node.children
    .map((child) => {
      if (child.type === 'text') {
        return child.value
      }

      return 'REDACTED'
    })
    .join('')
    .trim()

  if (node.depth === 1) {
    const block: BlockObjectRequest = {
      object: 'block',
      type: `heading_1`,
      heading_1: {
        rich_text: [
          {
            type: 'text',
            text: { content: text },
          },
        ],
        color: 'default',
      },
    }

    return { block, visitorResult: SKIP }
  } else if (node.depth === 2) {
    const block: BlockObjectRequest = {
      object: 'block',
      type: `heading_2`,
      heading_2: {
        rich_text: [
          {
            type: 'text',
            text: { content: text },
          },
        ],
        color: 'default',
      },
    }

    return { block, visitorResult: SKIP }
  } else if (node.depth === 3) {
    const block: BlockObjectRequest = {
      object: 'block',
      type: `heading_3`,
      heading_3: {
        rich_text: [
          {
            type: 'text',
            text: { content: text },
          },
        ],
        color: 'default',
      },
    }

    return { block, visitorResult: SKIP }
  } else {
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
}
