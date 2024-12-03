import { useI18n } from 'vue-i18n'

export const ts = (keys: string[]) => {
  const { t } = useI18n()
  return keys.map((key) => t(key))
}
