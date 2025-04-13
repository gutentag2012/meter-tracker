import React from 'react'
import { View } from 'react-native'
import { Href, Link, useRouter } from 'expo-router'
import { Button } from '@/modules/general/components/inputs/Button'
import { CogIcon, PencilIcon, Settings2Icon, SettingsIcon } from 'lucide-react-native'
import { useColors, useDefaultStyles } from '@/modules/general/theme'

type HeaderButtonsProps = {
  hideSettings?: boolean
  editUrl?: Href
  children?: React.ReactNode
}

export function HeaderButtons({
  children,
  editUrl,
  hideSettings,
}: HeaderButtonsProps) {
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  return (
    <View style={[defaultStyles.row, { gap: 0, marginRight: -8 }]}>
      {children}
      {editUrl && (
        <Button variant="icon" onPressIn={() => router.push(editUrl)}>
          <PencilIcon color={colors.text} />
        </Button>
      )}
      {!hideSettings && (
        <Button variant="icon" onPressIn={() => router.push("/settings")}>
          <Settings2Icon color={colors.text} />
        </Button>
      )}
    </View>
  )
}

export function HeaderButtonsWithEdit(editUrl: Href) {
  // eslint-disable-next-line react/display-name
  return () => <HeaderButtons editUrl={editUrl} />
}

export function HeaderButtonsOnlySettings() {
  // eslint-disable-next-line react/display-name
  return () => <HeaderButtons />
}
