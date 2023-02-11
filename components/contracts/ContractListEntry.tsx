import moment from 'moment'
import React, { FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Typography } from '../../constants/Theme'
import Contract from '../../services/database/entities/contract'

interface MeterListEntryProps {
  contract: Contract
}

type Props = MeterListEntryProps

export const ContractListEntry: FunctionComponent<Props> = ({ contract }) => {
  const subTitle = useMemo(() => {
    return `Think of what to display here`
  }, [])

  return <Ripple
    style={ styles.container }
    rippleColor={ Colors.secondaryContainer }
  >
    <View>
      <Text
        style={ styles.title }
        onSurface
      >
        { contract.name }
      </Text>
      <Text
        style={ styles.subtitle }
        onSurfaceVariant
      >
        { subTitle }
      </Text>
    </View>
    <Text
      style={ styles.value }
      onSurfaceVariant
    >
      { contract.pricePerUnit } Cent
    </Text>
  </Ripple>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 72,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
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
