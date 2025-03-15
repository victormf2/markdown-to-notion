import * as core from '@actions/core'

type LogMeta = Record<string, string | number>

export const logger = {
  info(meta: LogMeta, message: string) {
    const fullMessage = getFullMessage(message, meta)
    core.info(fullMessage)
  },
  warn(meta: LogMeta, message: string) {
    const fullMessage = getFullMessage(message, meta)
    core.warning(fullMessage)
  },
  error(meta: LogMeta, message: string) {
    const fullMessage = getFullMessage(message, meta)
    core.error(fullMessage)
  },
  debug(meta: LogMeta, message: string) {
    const fullMessage = getFullMessage(message, meta)
    core.debug(fullMessage)
  },
}
function getFullMessage(message: string, meta: LogMeta) {
  let fullMessage = message
  if (Object.keys(meta).length > 0) {
    fullMessage = fullMessage + ' - ' + JSON.stringify(meta)
  }
  return fullMessage
}
