import { MeterListEntry } from '@/meters/components/MeterListEntry'
import { type DetailedMeter } from '@/meters/meters.selector'
import { detailedMetersForBuilding } from '@/meters/meters.signals'
import React, { type FC } from 'react'

type Props = {
  onPress: (meter: DetailedMeter) => void
  navigateToAddMeasurement: (meter: DetailedMeter) => void
}

export const MeterListView: FC<Props> = ({ onPress, navigateToAddMeasurement }) => {
  return (
    <>
      {detailedMetersForBuilding.value.map((meter) => (
        <MeterListEntry
          key={meter.id}
          meter={meter}
          onPress={() => onPress(meter)}
          navigateToAddMeasurement={() => navigateToAddMeasurement(meter)}
        />
      ))}
    </>
  )
}
