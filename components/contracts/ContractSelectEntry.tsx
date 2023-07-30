import React, { FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, Text, TouchableOpacity, View } from 'react-native-ui-lib'
import Contract from '../../services/database/entities/contract'
import { Typography } from '../../setupTheme'

interface MeterListEntryProps {
  contract: Contract,
  selectedContract?: number,
  setSelectedContract?: (contractId?: number) => void,
}

type Props = MeterListEntryProps

export const ContractSelectEntry: FunctionComponent<Props> = ({
                                                                contract,
                                                                setSelectedContract,
                                                                selectedContract,
                                                              }) => {
  return <TouchableOpacity
    style={ styles.container }
    onPress={ () => setSelectedContract?.(selectedContract !== contract.id ? contract.id : undefined) }
  >
    <View
      flex
      row
    >
      <Checkbox
        color={ Colors.primary }
        value={ selectedContract === contract.id }
        onValueChange={ () => setSelectedContract?.(selectedContract !== contract.id ? contract.id : undefined) }
      />
      <Text
        style={ styles.title }
        onSurface
      >
        { contract.name }
      </Text>
    </View>
    <Text
      style={ styles.value }
      onSurface
    >
      { contract.pricePerUnit } Cent
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
