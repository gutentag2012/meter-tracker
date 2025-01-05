import { FormContextType } from '@formsignals/form-react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '@/modules/general/components/Button'
import { FormTextField } from '@/modules/general/components/TextField'
import { Fragment, useMemo } from 'react'
import { ValidatorAdapter } from '@formsignals/form-core'
import { batch } from '@preact/signals-react'
import { z } from 'zod'
import { Interval } from '../notifications'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {
  intervals,
  monthDates,
  weekdayDates,
} from '@/modules/general/constants'
import { formatDate, translate } from '@/modules/general/translations'

interface IntervalFormProps {
  form: FormContextType<Interval, ValidatorAdapter>
}

export function IntervalForm({ form }: IntervalFormProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        settingsListItem: {
          padding: 8,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: 'transparent',
          flexDirection: 'row',
          gap: 16,
          alignItems: 'center',
        },
        sectionTitle: {
          ...defaultStyles.detail,
          marginTop: 16,
          marginBottom: 8,
        },
      }),
    [defaultStyles],
  )

  return (
    <View>
      <Text style={styles.sectionTitle}>Interval</Text>
      <View style={[defaultStyles.row, { flexWrap: 'wrap' }]}>
        {Object.values(intervals).map((intervalKey) => (
          <Button
            key={intervalKey}
            variant="ghost"
            onPress={() => {
              batch(() => {
                if (
                  !form.json.peek().dayOf &&
                  (form.json.peek().dayOf !== 0 || intervalKey === 'monthly')
                ) {
                  form.handleChange('dayOf', 1)
                } else if (
                  intervalKey === 'weekly' &&
                  (form.json.peek().dayOf ?? 0) > 6
                ) {
                  form.handleChange('dayOf', 1)
                }
                if (!form.json.peek().monthOfYear) {
                  form.handleChange('monthOfYear', 1)
                }
                form.handleChange('type', intervalKey)
              })
            }}
            style={{
              backgroundColor:
                form.data.value.type.value === intervalKey
                  ? colors.background
                  : colors.card,
            }}
          >
            {translate(`intervals.${intervalKey}`)}
          </Button>
        ))}
      </View>
      {form.data.value.type.value === 'weekly' && (
        <Fragment>
          <Text style={styles.sectionTitle}>Weekday</Text>
          <View style={[defaultStyles.row, { flexWrap: 'wrap' }]}>
            {weekdayDates.map((weekday) => {
              const weekdayString = formatDate(weekday, 'EEEE')
              const dayOfWeekNumber = weekday.getDay()
              return (
                <Button
                  key={weekdayString}
                  variant="ghost"
                  onPress={() => {
                    form.handleChange('dayOf', dayOfWeekNumber)
                  }}
                  style={{
                    backgroundColor:
                      form.data.value.dayOf?.value === dayOfWeekNumber
                        ? colors.background
                        : colors.card,
                  }}
                >
                  {weekdayString}
                </Button>
              )
            })}
          </View>
        </Fragment>
      )}
      {form.data.value.type.value === 'yearly' && (
        <Fragment>
          <Text style={styles.sectionTitle}>Month</Text>
          <View style={[defaultStyles.row, { flexWrap: 'wrap' }]}>
            {monthDates.map((monthDate) => {
              const monthString = formatDate(monthDate, 'MMMM')
              return (
                <Button
                  key={monthString}
                  variant="ghost"
                  onPress={() => {
                    form.handleChange('monthOfYear', monthDate.getMonth() + 1)
                  }}
                  style={{
                    backgroundColor:
                      form.data.value.monthOfYear?.value ===
                      monthDate.getMonth() + 1
                        ? colors.background
                        : colors.card,
                  }}
                >
                  {monthString}
                </Button>
              )
            })}
          </View>
        </Fragment>
      )}
      {(form.data.value.type.value === 'monthly' ||
        form.data.value.type.value === 'yearly') && (
        <form.FieldProvider
          name="dayOf"
          transformFromBinding={(value: string) => {
            if (!value) return [0, translate('errors.required')]
            const parsed = parseFloat(value)
            return [parsed, isNaN(parsed) && translate('errors.number')]
          }}
          transformToBinding={(
            value: number | undefined,
            isValid: boolean,
            writeBuffer?: string,
          ): string => {
            if (!isValid) {
              return writeBuffer ?? '' // This is the last value entered by the user
            }
            return value?.toString() ?? '' // This is the last valid value
          }}
          validator={z
            .number({
              invalid_type_error: 'errors.number',
              required_error: 'errors.required',
            })
            .int('errors.integer')
            .min(0, 'errors.positive')
            .max(31, 'errors.lessThan31')}
        >
          <FormTextField
            style={{ width: '100%', paddingVertical: 4 }}
            containerStyle={{ marginTop: 16 }}
            selectTextOnFocus
            useTransformed
            label="Day of month"
            hint="Must be between 1 and 31"
            keyboardType="numeric"
          />
        </form.FieldProvider>
      )}
      <View
        style={[defaultStyles.row, { marginTop: 16, alignItems: 'flex-start' }]}
      >
        <View style={{ flex: 1 }}>
          <form.FieldProvider
            name="hour"
            transformFromBinding={(value: string) => {
              if (!value) return [0, translate('errors.required')]
              const parsed = parseFloat(value)
              return [parsed, isNaN(parsed) && translate('errors.number')]
            }}
            transformToBinding={(
              value: number | undefined,
              isValid: boolean,
              writeBuffer?: string,
            ): string => {
              if (!isValid) {
                return writeBuffer ?? '' // This is the last value entered by the user
              }
              return value?.toString() ?? '' // This is the last valid value
            }}
            validator={z
              .number({
                invalid_type_error: 'errors.number',
                required_error: 'errors.required',
              })
              .int('errors.integer')
              .min(0, 'errors.positive')
              .max(23, 'errors.timeHour')}
          >
            <FormTextField
              style={{ width: '100%', paddingVertical: 4 }}
              selectTextOnFocus
              useTransformed
              label="Hour"
              keyboardType="numeric"
            />
          </form.FieldProvider>
        </View>
        <View style={{ flex: 1 }}>
          <form.FieldProvider
            name="minute"
            transformFromBinding={(value: string) => {
              if (!value) return [0, translate('errors.required')]
              const parsed = parseFloat(value)
              return [parsed, isNaN(parsed) && translate('errors.number')]
            }}
            transformToBinding={(
              value: number | undefined,
              isValid: boolean,
              writeBuffer?: string,
            ): string => {
              if (!isValid) {
                return writeBuffer ?? '' // This is the last value entered by the user
              }
              return value?.toString() ?? '' // This is the last valid value
            }}
            validator={z
              .number({
                invalid_type_error: 'errors.number',
                required_error: 'errors.required',
              })
              .int('errors.integer')
              .min(0, 'errors.positive')
              .max(59, 'errors.timeMinute')}
          >
            <FormTextField
              style={{ width: '100%', paddingVertical: 4 }}
              selectTextOnFocus
              useTransformed
              label="Minute"
              keyboardType="numeric"
            />
          </form.FieldProvider>
        </View>
      </View>
    </View>
  )
}
