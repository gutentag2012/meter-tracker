import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const BackIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 0 24 24` }
    fill={ color }
  >
    <Path d='m10.5 19.7-6.75-6.75q-.2-.2-.287-.438-.088-.237-.088-.487t.088-.488q.087-.237.287-.437l6.775-6.775q.4-.4.938-.388.537.013.937.413.4.4.4.95 0 .55-.4.95L7.95 10.7h10.8q.55 0 .938.387.387.388.387.938 0 .55-.387.937-.388.388-.938.388H7.95l4.475 4.475q.4.4.387.938-.012.537-.412.937-.4.4-.95.4-.55 0-.95-.4Z' />
  </Svg>

}
