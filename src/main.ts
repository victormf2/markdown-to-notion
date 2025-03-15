import * as core from '@actions/core'
import { Client } from '@notionhq/client'
import { createBlocksFromMarkdown } from './create-blocks-from-markdown.js'
import { deleteAllBlocks } from './delete-all-blocks.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pageId: string = core.getInput('page_id', { required: true })
    const notionApiKey: string = core.getInput('notion_api_key', {
      required: true,
    })

    const notion = new Client({ auth: notionApiKey })

    await deleteAllBlocks(notion, pageId)
    await createBlocksFromMarkdown(notion, pageId)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.error(error)
      core.setFailed(error.message)
    }
  }
}
