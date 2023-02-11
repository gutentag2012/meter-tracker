import React, { FunctionComponent, ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Typography } from '../constants/Theme'

interface AppBarProps {
  title: string,
  actions?: ReactElement,
  loading?: boolean,
}

type Props = AppBarProps

export const AppBar: FunctionComponent<Props> = ({
                                                   title,
                                                   actions,
                                                   loading,
                                                 }) => {
  return <View marginB-16>
    <View
      style={ styles.container }
      row
      spread
      centerV
    >
      <Text
        style={ styles.title }
        onBackground
      >
        { title }
      </Text>
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
    alignItems: 'center',
  },
  title: {
    ...Typography.TitleLarge
  },
})
