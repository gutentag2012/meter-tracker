import React, { FunctionComponent } from 'react'
import { IconBase, IconBaseProps } from './IconBase'

const path = 'M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z'
export const AddIcon: FunctionComponent<IconBaseProps> = (props) => {
  return <IconBase { ...props } path={ path } />
}
