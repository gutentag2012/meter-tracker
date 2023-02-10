import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const CloseIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 0 24 24` }
    fill={ color }
  >
    <Path d='m12 13.4-4.9 4.9q-.275.275-.7.275-.425 0-.7-.275-.275-.275-.275-.7 0-.425.275-.7l4.9-4.9-4.9-4.9q-.275-.275-.275-.7 0-.425.275-.7.275-.275.7-.275.425 0 .7.275l4.9 4.9 4.9-4.9q.275-.275.7-.275.425 0 .7.275.275.275.275.7 0 .425-.275.7L13.4 12l4.9 4.9q.275.275.275.7 0 .425-.275.7-.275.275-.7.275-.425 0-.7-.275Z' />
  </Svg>

}
