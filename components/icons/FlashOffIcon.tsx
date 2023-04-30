import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const FlashOffIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M282.5 178.5h394l-80 280h159L638.5 627l-356-356v-92.5Zm120 789.5V653.5h-120V485l-216-216 53.5-53.5 720 720-53.5 53.5L551 753.5 402.5 968Z' />
  </Svg>

}
