import React, { type FunctionComponent } from 'react'
import { IconBase, type IconBaseProps } from './IconBase'

const path = 'm296-345-56-56 240-240 240 240-56 56-184-184-184 184Z'
export const ChevronUpIcon: FunctionComponent<IconBaseProps> = (props) => {
  return <IconBase {...props} path={path} />
}
