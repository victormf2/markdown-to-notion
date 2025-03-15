import * as core from '@actions/core'
import { createBlocksFromMarkdown } from './create-blocks-from-markdown.js'
import { deleteAllBlocks } from './delete-all-blocks.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pageId: string = core.getInput('page_id')

    await deleteAllBlocks(pageId)
    await createBlocksFromMarkdown(pageId)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
