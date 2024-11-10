import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { forwardRef, PropsWithChildren, ReactNode, useMemo } from 'react'

type ButtonProps = TouchableOpacityProps & {
  variant?: 'text' | 'outlined' | 'icon' | 'ghost'
  size?: 'small' | 'large'
  IconStart?: ReactNode
  IconEnd?: ReactNode
}

export const Button = forwardRef<TouchableOpacity, PropsWithChildren<ButtonProps>>(function (
  { variant = 'text', size = 'small', IconStart, IconEnd, style, children, ...props },
  ref
) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: size === 'small' ? 8 : 16,
          paddingVertical: (size === 'small' ? 4 : 8) * (variant === 'icon' ? 2 : 1),
          gap: size === 'small' ? 8 : 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
        containerOutlined: {
          borderColor: colors.outline,
          borderWidth: 1,
          borderRadius: 4,
        },
        containerGhost: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: 'transparent',
          borderRadius: 4,
        },
        textButton: {
          ...defaultStyles.detail,
          color: colors.primary,
        },
      }),
    [colors, defaultStyles, size, variant]
  )

  const containerStyle =
    variant === 'outlined'
      ? styles.containerOutlined
      : variant === 'ghost'
        ? styles.containerGhost
        : undefined
  const textStyle = variant === 'text' ? styles.textButton : defaultStyles.detail
  const content =
    typeof children === 'string' ? <Text style={textStyle}>{children}</Text> : children

  return (
    <TouchableOpacity ref={ref} style={[styles.container, containerStyle, style]} {...props}>
      {IconStart}
      {content}
      {IconEnd}
    </TouchableOpacity>
  )
})
