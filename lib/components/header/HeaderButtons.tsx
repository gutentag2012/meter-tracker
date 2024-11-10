import React from 'react'
import { View } from 'react-native'
import { Href, Link } from 'expo-router'
import { Button } from '@/lib/components/Button'
import { PencilIcon, Settings2Icon } from 'lucide-react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'

type HeaderButtonsProps = {
  hideSettings?: boolean
  editUrl?: Href<string>
  children?: React.ReactNode
}

export function HeaderButtons({ children, editUrl, hideSettings }: HeaderButtonsProps) {
  const defaultStyles = useDefaultStyles()
  const colors = useColors()

  return (
    <View style={[defaultStyles.row, { gap: 0, marginRight: -8 }]}>
      {children}
      {editUrl && (
        <Link href={editUrl} asChild>
          <Button variant='icon'>
            <PencilIcon color={colors.text} />
          </Button>
        </Link>
      )}
      {!hideSettings && (
        <Link href={`/settings`} asChild>
          <Button variant='icon'>
            <Settings2Icon color={colors.text} />
          </Button>
        </Link>
      )}
    </View>
  )
}

export function HeaderButtonsWithEdit(editUrl: Href<string>) {
  return () => <HeaderButtons editUrl={editUrl} />
}

export function HeaderButtonsOnlySettings() {
  return () => <HeaderButtons />
}
