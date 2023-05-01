import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const MailIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M160 896q-33 0-56.5-23.5T80 816V336q0-33 23.5-56.5T160 256h640q33 0 56.5 23.5T880 336v480q0 33-23.5 56.5T800 896H160Zm320-287q5 0 10.5-1.5T501 603l283-177q8-5 12-12.5t4-16.5q0-20-17-30t-35 1L480 536 212 368q-18-11-35-.5T160 397q0 10 4 17.5t12 11.5l283 177q5 3 10.5 4.5T480 609Z' />
  </Svg>

}
