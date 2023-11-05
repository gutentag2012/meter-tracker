import React, { type FunctionComponent } from 'react'
import { IconBase, type IconBaseProps } from './IconBase'

const path = 'M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z'
export const ChevronDownIcon: FunctionComponent<IconBaseProps> = (props) => {
  return <IconBase {...props} path={path} />
}
