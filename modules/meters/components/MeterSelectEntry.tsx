import { type DetailedMeter } from '@/meters/meters.selector'
import { type Signal } from '@preact/signals-react'
import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { Typography } from '../../../setupTheme'

interface MeterListEntryProps {
  meter: DetailedMeter
  selectedMeter: Signal<DetailedMeter | undefined>
}

type Props = MeterListEntryProps

export const MeterSelectEntry: FunctionComponent<Props> = ({ meter, selectedMeter }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        (selectedMeter.value = selectedMeter.peek()?.id !== meter.id ? meter : undefined)
      }
    >
      <View flex row>
        <Checkbox
          color={Colors.primary}
          value={selectedMeter.value?.id === meter.id}
          onValueChange={() =>
            (selectedMeter.value = selectedMeter.peek()?.id !== meter.id ? meter : undefined)
          }
        />
        <Text style={styles.title} onSurface>
          {meter.name} ({meter.unit})
        </Text>
      </View>
      <Text style={styles.value} onSurface>
        {meter.identification}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 56,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.BodyLarge,
    marginLeft: 16,
  },
  subtitle: {
    ...Typography.BodySmall,
  },
  value: {
    ...Typography.LabelSmall,
  },
})
