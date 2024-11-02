import { Text, View } from 'react-native'
import { useContractsForBuilding } from '@/modules/contracts/contracts.query'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { LibraryIcon } from 'lucide-react-native'
import { ContractListItem } from '@/modules/contracts/components/ContractListItem'
import { translate } from '@/lib/translations/i18n'

export function ContractList() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const [contracts] = useContractsForBuilding()

  return (
    <View style={[{ backgroundColor: colors.card, padding: 8, borderRadius: 8, gap: 16 }]}>
      {contracts.map((contract) => (
        <ContractListItem key={contract.contractId} contract={contract} />
      ))}
      {contracts.length === 0 && (
        <View style={{ alignItems: 'center', gap: 8, padding: 16 }}>
          <LibraryIcon color={colors.textMuted} />
          <Text style={[defaultStyles.detail, { color: colors.textMuted, textAlign: 'center' }]}>
            {translate('contracts.emptyList')}
          </Text>
        </View>
      )}
    </View>
  )
}
