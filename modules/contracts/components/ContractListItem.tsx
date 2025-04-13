import { Text, TouchableOpacity, View } from 'react-native'
import { CoinsIcon, HistoryIcon } from 'lucide-react-native'
import { Link, useRouter } from 'expo-router'
import { currency } from '@/modules/settings/currency.signals'
import { Fragment } from 'react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { formatNumber } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'

type ContractListItemProps = {
  contract: {
    contractId: number | null
    contractName: string | null
    contractIdentifier: string | null
    totalCostCurrentMonth: number | null
    monthlyPayment: number | null
    pricePerUnit: number | null
    contractUnit: string | null
    totalCostLastMonth: number | null
  }
}

export function ContractListItem({ contract }: ContractListItemProps) {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const costCurrentMonth = contract.totalCostCurrentMonth ?? 0
  return (
    // TODO Link to detail page
    <TouchableOpacity
      onPress={() => router.push(`/contract/${contract.contractId}/edit`)}
      style={{
        backgroundColor: colors.card,
        padding: 8,
        borderRadius: 4,
        borderWidth: 0,
      }}
    >
      <View style={[defaultStyles.row]}>
        <View>
          <Text style={[defaultStyles.cardTitle]}>{contract.contractName}</Text>
          {contract.contractIdentifier && (
            <Text style={[defaultStyles.detailSmall]}>
              {contract.contractIdentifier}
            </Text>
          )}
        </View>
        {costCurrentMonth !== null && (
          <Text
            style={[
              defaultStyles.detail,
              { flex: 1, textAlign: 'right', color: colors.text },
            ]}
          >
            {formatNumber(costCurrentMonth)}
            <Text style={defaultStyles.detailSmall}>
              {contract.monthlyPayment !== null
                ? ` /${formatNumber(contract.monthlyPayment)}`
                : ''}{' '}
              {currency.value.currencySymbol}
            </Text>
          </Text>
        )}
      </View>

      <View style={[defaultStyles.row, { marginTop: 8, flexWrap: 'wrap' }]}>
        <View style={[defaultStyles.iconText, { flex: 1 }]}>
          {contract.pricePerUnit !== null && (
            <Fragment>
              <CoinsIcon
                size={defaultStyles.detail.fontSize}
                stroke={colors.textMuted}
              />
              <Text style={defaultStyles.detail}>
                {formatNumber(contract.pricePerUnit, 4)}
                <Text style={defaultStyles.detailSmall}>
                  {' '}
                  {currency.value.currencySymbol}
                  {contract.contractUnit ? `/${contract.contractUnit}` : ''}
                </Text>
              </Text>
            </Fragment>
          )}
        </View>

        {contract.totalCostLastMonth !== null && (
          <View style={[defaultStyles.iconText, { alignSelf: 'flex-end' }]}>
            <HistoryIcon
              size={defaultStyles.detail.fontSize}
              stroke={colors.textMuted}
            />
            <Text style={defaultStyles.detail}>
              {formatNumber(contract.totalCostLastMonth, 2)}
              <Text style={defaultStyles.detailSmall}>
                {' '}
                {currency.value.currencySymbol}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
