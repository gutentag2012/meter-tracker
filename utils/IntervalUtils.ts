import moment from 'moment'

export interface IntervalDaily {
  type: 'Daily'
  hour: number,
  minute: number,
}

export interface IntervalWeekly {
  type: 'Weekly'
  dayOfWeek: number,
  hour: number,
  minute: number,
}

export interface IntervalMonthly {
  type: 'Monthly'
  dayOfMonth: number,
  hour: number,
  minute: number,
}

export interface IntervalYearly {
  type: 'Yearly'
  monthOfYear: number,
  dayOfMonth: number,
  hour: number,
  minute: number,
}

export type Interval = IntervalDaily | IntervalWeekly | IntervalMonthly | IntervalYearly

export const intervalToString = (interval: Interval) => {
  let res = interval.type
  if (interval.type === 'Weekly') {
    res += `  |  ${ moment()
      .isoWeekday(interval.dayOfWeek)
      .format('dddd') }`
  }
  if (interval.type === 'Monthly') {
    console.log("MONTHLY", interval)
    res += `  |  Day ${ interval.dayOfMonth.toString()
      .padStart(2, '0') }`
  }
  if (interval.type === 'Yearly') {
    res += `  |  ${ interval.dayOfMonth.toString()
      .padStart(2, '0') }. ${ moment()
      .month(interval.monthOfYear)
      .format('MMMM') }`
  }
  res += `  |  ${ interval.hour.toString()
    .padStart(2, '0') }:${ interval.minute.toString()
    .padStart(2, '0') }`
  return res
}

export const DefaultIntervalSetting: Interval = {
  type: 'Weekly',
  dayOfWeek: 0,
  hour: 12,
  minute: 0,
}
