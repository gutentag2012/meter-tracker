import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, Text, TouchableOpacity } from 'react-native-ui-lib'
import type Contract from '../../services/database/entities/contract'
import { Typography } from '../../setupTheme'

type Props = {
  contract: Contract
  selectedContract?: number
  setSelectedContract?: (contractId?: number) => void
}

export const ContractSelectEntry: FunctionComponent<Props> = ({
  contract,
  setSelectedContract,
  selectedContract,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        setSelectedContract?.(selectedContract !== contract.id ? contract.id : undefined)
      }
    >
      <Checkbox
        color={Colors.primary}
        value={selectedContract === contract.id}
        onValueChange={() =>
          setSelectedContract?.(selectedContract !== contract.id ? contract.id : undefined)
        }
        label={contract.name}
      />
      <Text style={styles.value} onSurface>
        {contract.pricePerUnit} Cent
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    ...Typography.LabelSmall,
  },
})
