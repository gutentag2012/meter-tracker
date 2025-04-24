import { Signal } from '@preact/signals-react'
import { useDefaultStyles } from '@/modules/general/theme'
import { View } from 'react-native'
import { DatePicker } from '@/modules/general/components'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'

type DatePickersProps = {
  from: Signal<Date | null>
  until: Signal<Date | null>
  selectedYears: Signal<string[]>
  nonOptional?: boolean
}

export function DatePickers({ from, until, selectedYears, nonOptional }: DatePickersProps) {
  useSignals()
  const defaultStyles = useDefaultStyles()
  return (
    <View style={[defaultStyles.row, { marginBottom: 8 }]}>
      <DatePicker
        disabled={!!selectedYears.value.length}
        value={from}
        nonOptional={nonOptional}
        label={translate('meters.graphs.from')}
      />
      <DatePicker
        disabled={!!selectedYears.value.length}
        value={until}
        nonOptional={nonOptional}
        label={translate('meters.graphs.until')}
      />
    </View>
  )
}