import { Signal } from '@preact/signals-react'
import { useDefaultStyles } from '@/modules/general/theme'
import { View } from 'react-native'
import { DatePicker } from '@/modules/general/components'
import { translate } from '@/modules/general/translations'

type DatePickersProps = {
  from: Signal<Date | null>
  until: Signal<Date | null>
  selectedYears: Signal<string[]>
}

export function DatePickers({ from, until, selectedYears }: DatePickersProps) {
  const defaultStyles = useDefaultStyles()
  return (
    <View style={[defaultStyles.row, { marginBottom: 8 }]}>
      <DatePicker
        disabled={!!selectedYears.value.length}
        value={from}
        label={translate('meters.graphs.from')}
      />
      <DatePicker
        disabled={!!selectedYears.value.length}
        value={until}
        label={translate('meters.graphs.until')}
      />
    </View>
  )
}