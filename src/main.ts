import * as core from '@actions/core'
import { Client } from '@notionhq/client'
import { createBlocksFromMarkdown } from './create-blocks-from-markdown.js'
import { deleteAllBlocks } from './delete-all-blocks.js'
import { getNotionPages } from './get-notion-pages.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const parentPageId: string = core.getInput('parent_page_id', {
      required: true,
    })
    const notionApiKey: string = core.getInput('notion_api_key', {
      required: true,
    })
    const files: string = core.getInput('files', { required: true })

    const notion = new Client({ auth: notionApiKey })

    const notionPages = await getNotionPages(notion, parentPageId, files)

    for (const notionPage of notionPages) {
      await deleteAllBlocks(notion, notionPage)
      await createBlocksFromMarkdown(notion, notionPage)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.error(error)
      core.setFailed(error.message)
    }
  }
}
