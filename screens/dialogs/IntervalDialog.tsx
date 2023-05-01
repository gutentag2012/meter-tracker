import moment from 'moment/moment'
import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Chip, Colors, Dialog, Text, View, WheelPicker } from 'react-native-ui-lib'
import { Input } from '../../components/Input'
import { Typography } from '../../constants/Theme'
import { DefaultIntervalSetting, Interval } from '../../utils/IntervalUtils'

export interface IntervalDialogProps {
  title?: string
  initialValue?: Interval
  onFinish?: (interval?: Interval) => void
  isVisible: boolean
  onDismiss: () => void
}

type Props = IntervalDialogProps

const intervalOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const

export const IntervalDialog: FunctionComponent<Props> = ({
                                                           title,
                                                           initialValue,
                                                           onDismiss,
                                                           onFinish,
                                                           isVisible,
                                                         }) => {
  const [value, setValue] = useState<Interval>(DefaultIntervalSetting)

  const textFieldValues = useRef({
    hour: '0',
    minute: '0',
  })

  useEffect(() => {
    setValue(initialValue ?? DefaultIntervalSetting)
    textFieldValues.current = {
      hour: initialValue?.hour.toString() ?? '0',
      minute: initialValue?.minute.toString() ?? '0',
    }
  }, [initialValue])

  return <Dialog
    onDismiss={ onDismiss }
    visible={ isVisible }
    width='100%'
    centerH
    centerV
    disablePan
    ignoreBackgroundPress
    overlayBackgroundColor={ Colors.overlay } // TODO Make correct color
    containerStyle={ {
      margin: 16,
      paddingVertical: 16,
      backgroundColor: Colors.surface,
      borderRadius: 4,
    } }
  >
    <Text style={ styles.titleDialog }>{ title }</Text>

    <View
      style={ {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
      } }
    >
      {
        intervalOptions.map(interval => (
          <Chip
            key={ interval }
            label={ interval }
            containerStyle={ [
              value.type === interval
              ? styles.chipActive
              : styles.chipInactive,
            ] }
            onPress={ () => setValue({
              ...(value as any),
              type: interval,
            }) }
          />))
      }
    </View>
    {
      value.type === 'Weekly' &&
        <View>
            <Text style={ styles.sectionTitle }>Day of Week</Text>
            <View
                style={ {
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  marginBottom: 8,
                } }
            >
              {
                moment.weekdays()
                  .map((weekday, index) => (
                    <Chip
                      key={ weekday }
                      label={ weekday }
                      containerStyle={ [
                        value.dayOfWeek === index
                        ? styles.chipActive
                        : styles.chipInactive,
                        { marginTop: 8 },
                      ] }
                      onPress={ () => setValue({
                        ...value,
                        dayOfWeek: index,
                      }) }
                    />))
              }
            </View>
        </View>
    }
    {
      value.type === 'Yearly' &&
        <View>
            <Text style={ styles.sectionTitle }>Month</Text>
            <View
                style={ {
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  paddingHorizontal: 16,
                  marginBottom: 8,
                } }
            >
              {
                moment.months()
                  .map((month, index) => (
                    <Chip
                      key={ month }
                      label={ month }
                      containerStyle={ [
                        value.monthOfYear === index + 1
                        ? styles.chipActive
                        : styles.chipInactive,
                        { marginTop: 8 },
                      ] }
                      onPress={ () => setValue({
                        ...value,
                        monthOfYear: index + 1,
                      }) }
                    />))
              }
            </View>
        </View>
    }
    {
      (value.type === 'Monthly' || value.type === 'Yearly') &&
        <View>
            <Text style={ styles.sectionTitle }>Day of Month</Text>
            <WheelPicker
                itemHeight={ 32 }
                numberOfVisibleRows={ 3 }
                items={ Array.from(Array(31)
                    .keys())
                  .map(i => ({
                    label: i + 1,
                    value: i + 1,
                  })) }
                initialValue={ value.dayOfMonth ?? 1 }
                activeTextColor={ Colors.primary }
                inactiveTextColor={ Colors.onBackground }
                faderProps={ { visible: false } }
                style={ { backgroundColor: Colors.surface } }
                separatorsStyle={ { borderColor: Colors.outline } }
                textStyle={ { ...Typography.LabelLarge } }
                onChange={ (
                  _: any,
                  index: number,
                ) => {
                  const dayOfMonth = index + 1
                  // If multiple elements are skipped, this is called in very fast succession
                  if (dayOfMonth === value.dayOfMonth) {
                    return
                  }
                  setValue({
                    ...value,
                    dayOfMonth,
                  })
                } }
            />
        </View>
    }

    <View
      style={ {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 16,
      } }
    >
      <Input
        outerContainerStyle={ {
          flex: 1,
          marginRight: 4,
        } }
        label={ 'Hour' }
        inputType={ 'numeric' }
        initialValue={ initialValue?.hour?.toString() ?? '0' }
        onChangeText={ text => textFieldValues.current.hour = text }
      />
      <Input
        outerContainerStyle={ {
          flex: 1,
          marginLeft: 4,
        } }
        label={ 'Minute' }
        inputType={ 'numeric' }
        initialValue={ initialValue?.minute?.toString() ?? '0' }
        onChangeText={ text => textFieldValues.current.minute = text }
      />
    </View>

    <View
      style={ {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto',
      } }
    >
      <Ripple
        rippleColor={ Colors.onBackground }
        rippleContainerBorderRadius={ 100 }
        rippleCentered
        onPress={ () => setTimeout(onDismiss, 100) }
        style={ {
          paddingVertical: 8,
          paddingHorizontal: 16,
          marginRight: 8,
        } }
      >
        <Text
          style={ {
            ...Typography.LabelLarge,
            color: Colors.primary,
          } }
        >
          Cancel
        </Text>
      </Ripple>
      <Ripple
        rippleColor={ Colors.onBackground }
        rippleContainerBorderRadius={ 100 }
        rippleCentered
        onPress={ () => setTimeout(() => {
          onFinish?.({
            ...value,
            hour: parseInt(textFieldValues.current.hour),
            minute: parseInt(textFieldValues.current.minute),
          })
          setValue(DefaultIntervalSetting)
          onDismiss()
        }, 100) }
        style={ {
          paddingVertical: 8,
          paddingHorizontal: 16,
        } }
      >
        <Text
          style={ {
            ...Typography.LabelLarge,
            color: Colors.primary,
          } }
        >
          Save
        </Text>
      </Ripple>
    </View>
  </Dialog>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipActive: {
    marginRight: 8,
    borderColor: Colors.secondaryContainer,
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
  },
  chipInactive: {
    marginRight: 8,
    borderColor: Colors.outline,
    color: Colors.onSurface,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  titleDialog: {
    ...Typography.TitleSmall,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
