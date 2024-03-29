import React, { FunctionComponent } from 'react'
import { IconBase, IconBaseProps } from './IconBase'

const path = 'M772-603 602-771l56-56q23-23 56.5-23t56.5 23l56 56q23 23 24 55.5T829-660l-57 57ZM160-120q-17 0-28.5-11.5T120-160v-113q0-8 3-15.5t9-13.5l412-412 170 170-412 412q-6 6-13.5 9t-15.5 3H160Z'
export const EditIcon: FunctionComponent<IconBaseProps> = (props) => {
  return <IconBase { ...props } path={ path } />
}
