import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

export interface IconBaseProps {
  color?: string
  size?: number
}

type Props = IconBaseProps & {
  path: string
  viewBox?: string
}

export const IconBase: FunctionComponent<Props> = ({
                                                     color = Colors.onBackground,
                                                     size = 24,
                                                     path,
                                                     viewBox = '0 -960 960 960',
                                                   }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ viewBox }
    fill={ color }
  >
    <Path d={ path } />
  </Svg>
}
