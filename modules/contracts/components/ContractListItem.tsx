import { Text, TouchableOpacity, View } from 'react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { CoinsIcon, HistoryIcon } from 'lucide-react-native'

type ContractListItemProps = {
  contract: {
    contractId: number | null
    contractName: string | null
    totalCostCurrentMonth: number | null
    monthlyPayment: number | null
    pricePerUnit: number | null
    contractUnit: string | null
    totalCostLastMonth: number | null
  }
}

// TODO Create conversion to Currencies
function convertToNextHigherCurrency(value: number) {
  return value / 100
}

export function ContractListItem({ contract }: ContractListItemProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  return (
    <TouchableOpacity>
      <View style={[defaultStyles.row]}>
        <Text style={[defaultStyles.cardTitle]}>{contract.contractName}</Text>
        {contract.totalCostCurrentMonth !== null && (
          <Text style={[defaultStyles.detail, { flex: 1, textAlign: 'right', color: colors.text }]}>
            {convertToNextHigherCurrency(contract.totalCostCurrentMonth).toFixed(2)}
            <Text style={defaultStyles.detailSmall}>
              {contract.monthlyPayment !== null ? ` /${contract.monthlyPayment.toFixed(2)}` : ''} €
            </Text>
          </Text>
        )}
      </View>

      <View style={[defaultStyles.row, { marginTop: 8, flexWrap: 'wrap' }]}>
        <View style={[defaultStyles.iconText, { flex: 1 }]}>
          {contract.pricePerUnit !== null && (
            <>
              <CoinsIcon size={defaultStyles.detail.fontSize} stroke={colors.textMuted} />
              <Text style={defaultStyles.detail}>
                {contract.pricePerUnit?.toFixed(2)}
                <Text style={defaultStyles.detailSmall}> cent/{contract.contractUnit}</Text>
              </Text>
            </>
          )}
        </View>

        {contract.totalCostLastMonth !== null && (
          <View style={[defaultStyles.iconText, { alignSelf: 'flex-end' }]}>
            <HistoryIcon size={defaultStyles.detail.fontSize} stroke={colors.textMuted} />
            <Text style={defaultStyles.detail}>
              {convertToNextHigherCurrency(contract.totalCostLastMonth).toFixed(2)}
              <Text style={defaultStyles.detailSmall}> €</Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
