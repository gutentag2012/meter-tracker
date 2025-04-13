import { Signal } from '@preact/signals-react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { View } from 'react-native'
import { Button } from '@/modules/general/components'
import { useSignals } from '@preact/signals-react/runtime'

type YearSelectsProps = {
  allYears: Signal<string[]>
  selectedYears: Signal<string[]>
}

export function YearSelects({ allYears, selectedYears }: YearSelectsProps) {
  useSignals()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  return (
    <View
      style={[
        defaultStyles.row,
        { flexWrap: 'wrap', paddingVertical: 8, paddingHorizontal: 16 },
      ]}
    >
      {allYears.value.map((year) => (
        <Button
          key={year}
          variant="ghost"
          onPress={() => {
            if (selectedYears.peek().includes(year)) {
              selectedYears.value = selectedYears
                .peek()
                .filter((y) => y !== year)
            } else {
              selectedYears.value = [...selectedYears.peek(), year]
            }
          }}
          style={{
            backgroundColor: colors.background,
            opacity: selectedYears.value.includes(year) ? 1 : 0.4,
          }}
        >
          {year}
        </Button>
      ))}
    </View>
  )
}