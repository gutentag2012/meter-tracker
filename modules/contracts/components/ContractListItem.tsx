import { Text, TouchableOpacity, View } from 'react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { CoinsIcon, HistoryIcon } from 'lucide-react-native'
import { Link } from 'expo-router'

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

// TODO Create conversion to Currencies

export function ContractListItem({ contract }: ContractListItemProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const costCurrentMonth = contract.totalCostCurrentMonth ?? 0
  return (
    <Link
      href={`/contract/${contract.contractId}`}
      asChild
      style={{ backgroundColor: colors.card, padding: 8, borderRadius: 4, borderWidth: 0 }}>
      <TouchableOpacity>
        <View style={[defaultStyles.row]}>
          <View>
            <Text style={[defaultStyles.cardTitle]}>{contract.contractName}</Text>
            {contract.contractIdentifier && (
              <Text style={[defaultStyles.detailSmall]}>{contract.contractIdentifier}</Text>
            )}
          </View>
          {costCurrentMonth !== null && (
            <Text
              style={[defaultStyles.detail, { flex: 1, textAlign: 'right', color: colors.text }]}>
              {costCurrentMonth.toFixed(2)}
              <Text style={defaultStyles.detailSmall}>
                {contract.monthlyPayment !== null ? ` /${contract.monthlyPayment.toFixed(2)}` : ''}{' '}
                €
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
                  {contract.pricePerUnit?.toFixed(4)}
                  <Text style={defaultStyles.detailSmall}> €/{contract.contractUnit}</Text>
                </Text>
              </>
            )}
          </View>

          {contract.totalCostLastMonth !== null && (
            <View style={[defaultStyles.iconText, { alignSelf: 'flex-end' }]}>
              <HistoryIcon size={defaultStyles.detail.fontSize} stroke={colors.textMuted} />
              <Text style={defaultStyles.detail}>
                {contract.totalCostLastMonth.toFixed(2)}
                <Text style={defaultStyles.detailSmall}> €</Text>
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  )
}
