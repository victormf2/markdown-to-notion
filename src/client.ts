import { Client } from '@notionhq/client'

function buildClient() {
  const notionKey = process.env.NOTION_KEY
  if (notionKey == null) {
    throw new Error('Please set the NOTION_KEY environment variable.')
  }
  const notion = new Client({ auth: notionKey })

  return { notion }
}

const { notion } = buildClient()

export { notion }
