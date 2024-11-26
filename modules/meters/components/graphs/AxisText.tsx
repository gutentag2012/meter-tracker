import { SkFont } from '@shopify/react-native-skia'
import { Text as SkiaText } from '@shopify/react-native-skia'

export function AxisText({
  x,
  y,
  text,
  color,
  font,
  axis,
}: {
  x: number
  y: number
  text: string
  color: string
  font: SkFont
  axis: 'x' | 'y'
}) {
  if (!font) return null

  const fontSize = font.measureText(text)

  return (
    <SkiaText
      x={axis === 'x' ? x - fontSize.width / 2 : x}
      y={axis === 'x' ? y : y + fontSize.height / 2}
      text={text}
      color={color}
      font={font}
    />
  )
}
