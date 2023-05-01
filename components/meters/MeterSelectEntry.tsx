import React, { FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { Typography } from '../../constants/Theme'
import Meter from '../../services/database/entities/meter'

interface MeterListEntryProps {
  meter: Meter,
  selectedMeter?: Meter,
  setSelectedMeter?: (meter?: Meter) => void,
}

type Props = MeterListEntryProps

export const MeterSelectEntry: FunctionComponent<Props> = ({
                                                             meter,
                                                             selectedMeter,
                                                             setSelectedMeter,
                                                           }) => {
  return <TouchableOpacity
    style={ styles.container }
    onPress={ () => setSelectedMeter?.(selectedMeter?.id !== meter.id ? meter : undefined) }
  >
    <View
      flex
      row
    >
      <Checkbox
        color={ Colors.primary }
        value={ selectedMeter?.id === meter.id }
        onValueChange={ () => setSelectedMeter?.(selectedMeter?.id !== meter.id ? meter : undefined) }
      />
      <Text
        style={ styles.title }
        onSurface
      >
        { meter.name } ({ meter.unit })
      </Text>
    </View>
    <Text
      style={ styles.value }
      onSurfaceVariant
    >
      { meter.identification }
    </Text>
  </TouchableOpacity>
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
