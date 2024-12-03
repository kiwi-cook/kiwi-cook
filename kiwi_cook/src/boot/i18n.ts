import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US']

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition

export const i18n = createI18n({
  locale: 'de',
  legacy: false,
  messages,
})

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})
