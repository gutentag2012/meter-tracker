import React, { FunctionComponent } from 'react'
import { IconBase, IconBaseProps } from './IconBase'

const path = 'M400-80q-33 0-56.5-23.5T320-160v-368L84-764q-11-11-11-28t11-28q11-11 28-11t28 11l680 680q11 11 11 28t-11 28q-11 11-28 11t-28-11L640-208v48q0 33-23.5 56.5T560-80H400Zm240-354L394-680h326v40l-80 120v86Zm80-326H314l-69-69q9-23 29-37t46-14h320q33 0 56.5 23.5T720-800v40Z'
export const FlashOffIcon: FunctionComponent<IconBaseProps> = (props) => {
  return <IconBase { ...props } path={ path } />
}
