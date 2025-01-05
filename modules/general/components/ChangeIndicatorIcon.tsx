import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react-native'
import { useColors } from '@/modules/general/theme'

export function ChangeIndicatorIcon({ change }: { change: number }) {
  const colors = useColors()
  if (change > 0) return <ArrowUpIcon size={12} stroke={colors.negative} />
  if (change < 0) return <ArrowDownIcon size={12} stroke={colors.positive} />
  return <MinusIcon size={12} stroke={colors.textMuted} />
}
