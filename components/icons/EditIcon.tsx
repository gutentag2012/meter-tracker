import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const EditIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 96 960 960` }
    fill={ color }
  >
    <Path d='M772 453 602 285l56-56q23-23 56.5-23t56.5 23l56 56q23 23 24 55.5T829 396l-57 57ZM160 936q-17 0-28.5-11.5T120 896V783q0-8 3-15.5t9-13.5l412-412 170 170-412 412q-6 6-13.5 9t-15.5 3H160Z' />
  </Svg>

}
