import { i18n } from 'boot/i18n';

export function toTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  const { t } = i18n.global;
  const weekday = t(`units.date.weekdays.${date.toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase()}`);
  const day = date.getDate();
  const the = t('units.date.the');
  const month = t(`units.date.months.${date.toLocaleDateString(undefined, { month: 'long' }).toLowerCase()}`);

  return `${weekday}, ${the} ${day}. ${month}`;
}
