import React, { FunctionComponent, ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Typography } from '../constants/Theme'
import { IconButton } from './IconButton'
import { BackIcon } from './icons/BackIcon'
import { CloseIcon } from './icons/CloseIcon'

interface AppBarProps {
  title: string,
  actions?: ReactElement,
  leftAction?: ReactElement,
  loading?: boolean,
}

type Props = AppBarProps

export const AppBar: FunctionComponent<Props> = ({
                                                   title,
                                                   actions,
                                                   loading,
  leftAction
                                                 }) => {
  return <View marginB-16>
    <View
      style={ styles.container }
      row
      spread
      centerV
    >
      <View row centerV>
        {
          leftAction
        }
        <Text
          style={ styles.title }
          onBackground
        >
          { title }
        </Text>
      </View>

      <View style={ styles.buttonContainer }>
        { actions }
      </View>
    </View>
    {
      loading &&
        <ProgressBar
            indeterminate
            width={ null }
            color={ Colors.onSecondaryContainer }
            unfilledColor={ Colors.secondaryContainer }
            borderWidth={ 0 }
            borderRadius={ 0 }
        />
    }
  </View>
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    height: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  title: {
    ...Typography.TitleMedium
  },
})
