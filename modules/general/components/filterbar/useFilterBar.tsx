import { useSignal } from '@preact/signals-react'
import { useMemo, useRef } from 'react'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Signal } from '@preact/signals-core'
import { FilterBottomSheet } from '@/modules/general/components/filterbar'

export function useFilterBar(defaultFrom: Date | null = null, defaultUntil: Date | null = null) {
  const from = useSignal<Date | null>(defaultFrom)
  const until = useSignal<Date | null>(defaultUntil)
  const selectedYears = useSignal<string[]>([])

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  return useMemo(() => ({
    filters: {
      from,
      until,
      selectedYears,
    },
    openFilter() {
      bottomSheetRef.current?.present()
    },
    FilterBottomSheet({allYears}: {allYears: Signal<string[]>}) {
      return (
        <FilterBottomSheet
          bottomSheetRef={bottomSheetRef}
          from={from}
          until={until}
          selectedYears={selectedYears}
          allYears={allYears}
        />
      )
    }
  }), [from, until, selectedYears])
}