import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const ExportIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M480 736q-17 0-28.5-11.5T440 696V410l-75 75q-12 12-28 12t-29-13q-12-12-11.5-28.5T308 428l144-144q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l144 144q12 12 11.5 28.5T652 484q-12 12-28.5 12.5T595 485l-75-75v286q0 17-11.5 28.5T480 736ZM240 896q-33 0-56.5-23.5T160 816v-80q0-17 11.5-28.5T200 696q17 0 28.5 11.5T240 736v80h480v-80q0-17 11.5-28.5T760 696q17 0 28.5 11.5T800 736v80q0 33-23.5 56.5T720 896H240Z' />
  </Svg>

}
