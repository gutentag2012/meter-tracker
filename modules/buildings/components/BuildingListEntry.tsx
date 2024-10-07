import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Typography } from '../../../setupTheme'
import type Building from '../../services/database/entities/building'
import { ApartmentIcon } from '../../../components/icons/ApartmentIcon'
import { t } from '../../i18n'

type Props = {
  building: Building
  onPress?: (building: Building) => void
}

export const BuildingListEntry: FunctionComponent<Props> = ({ building, onPress }) => {
  return (
    <Ripple
      style={styles.container}
      rippleColor={Colors.onSurface}
      onPress={() => onPress?.(building)}
    >
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ marginRight: 8 }}>
          <ApartmentIcon />
        </View>
        <View style={{ display: 'flex' }}>
          <Text style={styles.title} onSurface>
            {building.name}
          </Text>
          <Text style={styles.subtitle} onSurface>
            {building.address ?? t('buildings:no_address_provided')}
          </Text>
        </View>
      </View>
    </Ripple>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.BodyLarge,
  },
  subtitle: {
    ...Typography.BodySmall,
  },
  value: {
    ...Typography.LabelSmall,
  },
})
