import { StatusBar } from 'expo-status-bar'
import moment from 'moment/moment'
import React, { type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Chip, Colors, Dialog, Text, View } from 'react-native-ui-lib'
import { Typography } from '../../../setupTheme'
import { DefaultIntervalSetting, type Interval, translateInterval } from '@utils/IntervalUtils'
import { type Signal } from '@preact/signals-react'
import { t } from '@/i18n'
import { Input } from '../../../components/Input'

export interface IntervalDialogProps {
  title?: string
  initialValue?: Interval
  onFinish?: (interval?: Interval) => void
}

type Props = {
  isVisible: Signal<boolean>
  state: Signal<IntervalDialogProps>
}

const intervalOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const

export const IntervalDialog: FunctionComponent<Props> = ({ isVisible, state }) => {
  const { title, initialValue, onFinish } = state.value

  const [value, setValue] = useState<Interval>(DefaultIntervalSetting)
  const [errors, setErrors] = useState<Record<string, string>>({
    dayOfWeek: '',
    dayOfMonth: '',
    monthOfYear: '',
  })

  const textFieldValues = useRef({
    hour: '0',
    minute: '0',
    dayOfMonth: '1',
  })

  useEffect(() => {
    setErrors({
      dayOfWeek: '',
      dayOfMonth: '',
      monthOfYear: '',
    })
    setValue(initialValue ?? DefaultIntervalSetting)
    textFieldValues.current = {
      hour: initialValue?.hour.toString() ?? '0',
      minute: initialValue?.minute.toString() ?? '0',
      dayOfMonth:
        initialValue?.type === 'Monthly' || initialValue?.type === 'Yearly'
          ? initialValue.dayOfMonth.toString()
          : '1',
    }
  }, [initialValue])

  const onSave = useCallback(
    () =>
      setTimeout(() => {
        const interval = {
          ...value,
          hour: parseInt(textFieldValues.current.hour),
          minute: parseInt(textFieldValues.current.minute),
          dayOfMonth: parseInt(textFieldValues.current.dayOfMonth),
        }

        const foundErrors = {} as Record<string, string>
        if (interval.type === 'Weekly' && interval.dayOfWeek === undefined) {
          foundErrors['dayOfWeek'] = t('validationMessage:required')
        }

        if (
          (interval.type === 'Monthly' || interval.type === 'Yearly') &&
          interval.dayOfMonth === undefined
        ) {
          foundErrors['dayOfMonth'] = t('validationMessage:required')
        }
        if (
          (interval.type === 'Monthly' || interval.type === 'Yearly') &&
          (interval.dayOfMonth < 1 || interval.dayOfMonth > 31)
        ) {
          foundErrors['dayOfMonth'] = t('validationMessage:dayOfMonthNotInRange')
        }

        if (interval.type === 'Yearly' && interval.monthOfYear === undefined) {
          foundErrors['monthOfYear'] = t('validationMessage:required')
        }
        if (interval.type === 'Yearly' && (interval.monthOfYear < 1 || interval.monthOfYear > 12)) {
          foundErrors['monthOfYear'] = t('validationMessage:monthNotInRange')
        }

        if (Object.keys(foundErrors).length > 0) {
          setErrors(foundErrors)
          return
        }

        onFinish?.(interval)
        setValue(DefaultIntervalSetting)
        isVisible.value = false
      }, 100),
    [value, onFinish, isVisible]
  )

  return (
    <Dialog
      onDismiss={() => (isVisible.value = false)}
      visible={isVisible.value}
      width="100%"
      centerH
      centerV
      ignoreBackgroundPress
      overlayBackgroundColor={Colors.overlay}
      containerStyle={{
        margin: 16,
        paddingVertical: 16,
        backgroundColor: Colors.surface,
        borderRadius: 4,
      }}
    >
      <StatusBar
        style={Platform.OS === 'ios' ? 'light' : 'auto'}
        backgroundColor={Colors.overlay}
      />
      <Text style={styles.titleDialog}>{title}</Text>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 16,
        }}
      >
        {intervalOptions.map((interval) => (
          <Chip
            key={interval}
            label={translateInterval(interval)}
            containerStyle={[
              value.type === interval ? styles.chipActive : styles.chipInactive,
              { marginBottom: 8 },
            ]}
            onPress={() =>
              setValue({
                ...(value as any),
                type: interval,
              })
            }
          />
        ))}
      </View>
      {value.type === 'Weekly' && (
        <View>
          <Text style={styles.sectionTitle}>{t('utils:day_of_week')}</Text>
          {errors.dayOfWeek && <Text style={styles.labelError}>{errors.dayOfWeek}</Text>}
          <View
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            {moment.weekdays().map((weekday, index) => (
              <Chip
                key={weekday}
                label={weekday}
                containerStyle={[
                  value.dayOfWeek === index ? styles.chipActive : styles.chipInactive,
                  { marginTop: 8 },
                ]}
                onPress={() =>
                  setValue({
                    ...value,
                    dayOfWeek: index,
                  })
                }
              />
            ))}
          </View>
        </View>
      )}
      {value.type === 'Yearly' && (
        <View>
          <Text style={styles.sectionTitle}>{t('utils:month')}</Text>
          {errors.monthOfYear && <Text style={styles.labelError}>{errors.monthOfYear}</Text>}
          <View
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            {moment.months().map((month, index) => (
              <Chip
                key={month}
                label={month}
                containerStyle={[
                  value.monthOfYear === index + 1 ? styles.chipActive : styles.chipInactive,
                  { marginTop: 8 },
                ]}
                onPress={() =>
                  setValue({
                    ...value,
                    monthOfYear: index + 1,
                  })
                }
              />
            ))}
          </View>
        </View>
      )}
      {errors.dayOfMonth && <Text style={styles.labelError}>{errors.dayOfMonth}</Text>}
      {(value.type === 'Monthly' || value.type === 'Yearly') && (
        <Input
          outerContainerStyle={{
            paddingHorizontal: 16,
          }}
          label={t('utils:day_of_month')}
          inputType={'numeric'}
          initialValue={
            initialValue?.type === 'Monthly' || initialValue?.type === 'Yearly'
              ? initialValue.dayOfMonth.toString()
              : '1'
          }
          onChangeText={(text) => (textFieldValues.current.dayOfMonth = text)}
        />
      )}

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingHorizontal: 16,
        }}
      >
        <Input
          outerContainerStyle={{
            flex: 1,
            marginRight: 4,
          }}
          label={t('utils:hour')}
          inputType={'numeric'}
          initialValue={initialValue?.hour?.toString() ?? '0'}
          onChangeText={(text) => (textFieldValues.current.hour = text)}
        />
        <Input
          outerContainerStyle={{
            flex: 1,
            marginLeft: 4,
          }}
          label={t('utils:minute')}
          inputType={'numeric'}
          initialValue={initialValue?.minute?.toString() ?? '0'}
          onChangeText={(text) => (textFieldValues.current.minute = text)}
        />
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginLeft: 'auto',
        }}
      >
        <Ripple
          rippleColor={Colors.onBackground}
          rippleContainerBorderRadius={100}
          rippleCentered
          onPress={() => setTimeout(() => (isVisible.value = false), 100)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              ...Typography.LabelLarge,
              color: Colors.primary,
            }}
          >
            {t('utils:cancel')}
          </Text>
        </Ripple>
        <Ripple
          rippleColor={Colors.onBackground}
          rippleContainerBorderRadius={100}
          rippleCentered
          onPress={onSave}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              ...Typography.LabelLarge,
              color: Colors.primary,
            }}
          >
            {t('utils:save')}
          </Text>
        </Ripple>
      </View>
    </Dialog>
  )
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
  labelError: {
    ...Typography.BodySmall,
    color: Colors.error,
    paddingHorizontal: 16,
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
