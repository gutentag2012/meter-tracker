import { type DetailedContract } from '@/contracts/contracts.selector'
import { type Signal } from '@preact/signals-react'
import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, Text, TouchableOpacity } from 'react-native-ui-lib'
import { Typography } from '../../../setupTheme'

type Props = {
  contract: DetailedContract
  selectedContract: Signal<number | null>
}

export const ContractSelectEntry: FunctionComponent<Props> = ({ contract, selectedContract }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        (selectedContract.value = selectedContract.peek() !== contract.id ? contract.id : null)
      }
    >
      <Checkbox
        color={Colors.primary}
        value={selectedContract.value === contract.id}
        onValueChange={() =>
          (selectedContract.value = selectedContract.peek() !== contract.id ? contract.id : null)
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
