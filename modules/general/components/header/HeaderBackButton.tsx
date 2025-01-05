import { useRouter } from 'expo-router'
import { Button } from '@/modules/general/components/Button'
import { ArrowLeftIcon, XIcon } from 'lucide-react-native'
import { useColors } from '@/modules/general/theme'

type HeaderBackButtonProps = {
  canGoBack?: boolean
}

export function HeaderBackButton(props: HeaderBackButtonProps) {
  const router = useRouter()
  const colors = useColors()

  if (!props.canGoBack) {
    return null
  }

  return (
    <Button
      {...props}
      variant="icon"
      onPress={() => router.back()}
      style={{
        marginRight: 8,
        marginLeft: -8,
      }}
    >
      <ArrowLeftIcon color={colors.text} />
    </Button>
  )
}

export function makeHeaderBackButton(withBack?: boolean) {
  // eslint-disable-next-line react/display-name
  return () => <HeaderBackButton canGoBack={withBack} />
}

export function HeaderDialogBackButton(props: HeaderBackButtonProps) {
  const router = useRouter()
  const colors = useColors()

  if (!props.canGoBack) {
    return null
  }

  return (
    <Button
      {...props}
      variant="icon"
      onPress={() => router.back()}
      style={{
        marginRight: 8,
        marginLeft: -8,
      }}
    >
      <XIcon color={colors.text} />
    </Button>
  )
}

export function makeHeaderDialogBackButton(withBack?: boolean) {
  // eslint-disable-next-line react/display-name
  return () => <HeaderDialogBackButton canGoBack={withBack} />
}
