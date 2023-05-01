import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const NotificationIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M200 856q-17 0-28.5-11.5T160 816q0-17 11.5-28.5T200 776h40V496q0-83 50-147.5T420 264v-28q0-25 17.5-42.5T480 176q25 0 42.5 17.5T540 236v28q80 20 130 84.5T720 496v280h40q17 0 28.5 11.5T800 816q0 17-11.5 28.5T760 856H200Zm280 120q-33 0-56.5-23.5T400 896h160q0 33-23.5 56.5T480 976Z' />
  </Svg>

}
