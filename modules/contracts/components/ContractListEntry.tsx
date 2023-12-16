import { type DetailedContract } from '@/contracts/contracts.selector'
import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'
import { parseValueForDigits } from '@utils/TranslationUtils'

interface ContractListEntryProps {
  contract: DetailedContract
  onPress?: (contract: DetailedContract) => void
}

type Props = ContractListEntryProps

export const ContractListEntry: FunctionComponent<Props> = ({ contract, onPress }) => {
  const priceRatio = (contract.pricePerUnit / 100) * contract.conversion
  const lastMonthsCost = (contract.lastMonthConsumption ?? 0) * priceRatio
  const thisMonthsConst = (contract.thisMonthConsumption ?? 0) * priceRatio

  return (
    <Ripple
      style={styles.container}
      rippleColor={Colors.onSurface}
      onPress={() => onPress?.(contract)}
    >
      <View style={{ display: 'flex' }}>
        <Text style={styles.title} onSurface>
          {contract.name}
        </Text>
        <Text style={styles.subtitle} onSurface>
          {t('contract:this_month')} {parseValueForDigits(thisMonthsConst, 2)}€
        </Text>
        <Text style={styles.subtitle} onSurface>
          {t('contract:last_month')} {parseValueForDigits(lastMonthsCost, 2)}€
        </Text>
      </View>
      <Text style={styles.value} onSurface>
        {contract.pricePerUnit} Cent
      </Text>
    </Ripple>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 72 + 8,
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
    height: 16,
  },
  value: {
    ...Typography.LabelSmall,
  },
})
