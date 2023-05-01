import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const ImportIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M480 719q-8 0-15-2.5t-13-8.5L308 564q-11-11-11-28t11-28q11-11 28.5-11.5T365 507l75 75V296q0-17 11.5-28.5T480 256q17 0 28.5 11.5T520 296v286l75-75q11-11 28.5-10.5T652 508q11 11 11 28t-11 28L508 708q-6 6-13 8.5t-15 2.5ZM240 896q-33 0-56.5-23.5T160 816v-80q0-17 11.5-28.5T200 696q17 0 28.5 11.5T240 736v80h480v-80q0-17 11.5-28.5T760 696q17 0 28.5 11.5T800 736v80q0 33-23.5 56.5T720 896H240Z' />
  </Svg>

}
