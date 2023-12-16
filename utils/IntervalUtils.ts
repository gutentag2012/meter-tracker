import moment from 'moment'
import { type LangKey } from '../lang/en'
import { t } from '../modules/i18n'

export interface IntervalDaily {
  type: 'Daily'
  hour: number
  minute: number
}

export interface IntervalWeekly {
  type: 'Weekly'
  dayOfWeek: number
  hour: number
  minute: number
}

export interface IntervalMonthly {
  type: 'Monthly'
  dayOfMonth: number
  hour: number
  minute: number
}

export interface IntervalYearly {
  type: 'Yearly'
  monthOfYear: number
  dayOfMonth: number
  hour: number
  minute: number
}

export type Interval = IntervalDaily | IntervalWeekly | IntervalMonthly | IntervalYearly

export const translateInterval = (type: Interval['type']) => {
  return t(`utils:interval_${type.toLowerCase()}` as LangKey)
}

export const intervalToString = (interval?: Interval) => {
  if (!interval) return ''

  let res = translateInterval(interval.type)
  if (interval.type === 'Weekly') {
    res += `  |  ${moment().isoWeekday(interval.dayOfWeek).format('dddd')}`
  }
  if (interval.type === 'Monthly') {
    res += `  |  Day ${interval.dayOfMonth.toString().padStart(2, '0')}`
  }
  if (interval.type === 'Yearly') {
    res += `  |  ${interval.dayOfMonth.toString().padStart(2, '0')}. ${moment()
      .month(interval.monthOfYear - 1)
      .format('MMMM')}`
  }
  res += `  |  ${interval.hour.toString().padStart(2, '0')}:${interval.minute
    .toString()
    .padStart(2, '0')}`
  return res
}

export const DefaultIntervalSetting: Interval = {
  type: 'Weekly',
  dayOfWeek: 0,
  hour: 12,
  minute: 0,
}
