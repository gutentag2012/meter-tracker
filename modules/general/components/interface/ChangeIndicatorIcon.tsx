import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react-native'
import { useColors } from '@/modules/general/theme'

export function ChangeIndicatorIcon({ change, meterType }: { change: number; meterType: string | null }) {
  const colors = useColors()

  const shouldSwapColors = meterType === 'generation'
  const colorNegative = shouldSwapColors ? colors.positive : colors.negative
  const colorPositive = shouldSwapColors ? colors.negative : colors.positive

  if (change > 0) return <ArrowUpIcon size={12} stroke={colorNegative} />
  if (change < 0) return <ArrowDownIcon size={12} stroke={colorPositive} />
  return <MinusIcon size={12} stroke={colors.textMuted} />
}
