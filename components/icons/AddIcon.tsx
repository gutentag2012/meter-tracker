import React, { FunctionComponent } from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from 'react-native-ui-lib'

interface closeProps {
  color?: string
  size?: number
}

type Props = closeProps

export const AddIcon: FunctionComponent<Props> = ({
                                                      color = Colors.onBackground,
                                                      size =24,
                                                    }) => {
  return <Svg
    height={ size }
    width={ size }
    viewBox={ `0 0 24 24` }
    fill={ color }
  >
    <Path d='M12 19.35q-.55 0-.938-.388-.387-.387-.387-.937V13.3H5.95q-.55 0-.937-.388-.388-.387-.388-.937t.388-.938q.387-.387.937-.387h4.725V5.925q0-.55.387-.938Q11.45 4.6 12 4.6q.55 0 .938.387.387.388.387.938v4.725h4.725q.55 0 .938.387.387.388.387.938 0 .55-.387.937-.388.388-.938.388h-4.725v4.725q0 .55-.387.937-.388.388-.938.388Z' />
  </Svg>

}
