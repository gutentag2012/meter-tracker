import { Dimensions, Text, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, useLocalSearchParams } from 'expo-router'
import { useContractById } from '@/modules/contracts/contracts.query'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtonsWithEdit } from '@/modules/general/components/header/HeaderButtons'
import { useColors, useDefaultStyles } from '@/modules/general/theme'

const width = Dimensions.get('window').width

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { contractId: contractIdRaw } = useLocalSearchParams()
  const contractId = parseInt(contractIdRaw as string)
  const [contract] = useContractById(contractId)

  return (
    <View style={[defaultStyles.pageContainer]}>
      <Stack.Screen
        options={{
          title: contract?.contract?.name || '',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
          headerRight: HeaderButtonsWithEdit(
            `/contract/${contractId}/edit` as Href,
          ),
        }}
      />

      <View style={{ flexDirection: 'row', gap: 8, height: width - 48 }}>
        <View
          style={{
            backgroundColor: colors.card,
            width: ((width - 36) * 2) / 3,
            height: ((width - 36) * 2) / 3,
          }}
        />
        <View style={{ gap: 8 }}>
          <View
            style={{
              backgroundColor: colors.card,
              width: (width - 48) / 3,
              height: (width - 48) / 3,
              padding: 8,
            }}
          >
            <Text style={defaultStyles.detail}>Test</Text>
          </View>
          <View
            style={{
              backgroundColor: colors.card,
              width: (width - 48) / 3,
              height: (width - 48) / 3,
            }}
          />
        </View>
      </View>
    </View>
  )
}
