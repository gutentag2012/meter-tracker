import { Alert, ColorSchemeName, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import {
  BellIcon,
  BugIcon,
  CalendarDaysIcon,
  CloudIcon,
  CoinsIcon,
  DownloadIcon,
  FlagIcon,
  LanguagesIcon,
  MessageSquareReplyIcon,
  RefreshCcwIcon,
  ShieldAlertIcon,
  StarIcon,
  SunIcon,
  TriangleAlertIcon,
  UploadIcon,
  WaypointsIcon,
} from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Button } from '@/lib/components/Button'
import { makeHeaderBackButton } from '@/lib/components/header/HeaderBackButton'
import { currencyCode } from '@/modules/general/settings/currency.signals'
import { language } from '@/modules/general/settings/language.signals'
import { Currencies, CurrencyKeys } from '@/lib/constants/currencies'
import { useSelectField } from '@/lib/components/SelectField'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LangKey } from '@/lib/translations/en'
import { Languages } from '@/lib/constants/languages'
import { router } from 'expo-router'
import { useSignal } from '@preact/signals-react'
import { theme } from '@/modules/general/settings/theme.signals'

const languageOptions = [
  {
    label: translate('settings.languageSelectValues.undefined'),
    description: translate('settings.languageSelectValues.defaultDescription'),
    value: undefined,
  },
  ...Object.values(Languages).map((value) => ({
    label: translate(`settings.languageSelectValues.${value}` as LangKey),
    value,
  })),
]
const currencyOptions = [
  {
    label: translate('settings.currencySelectValues.undefined'),
    description: translate('settings.currencySelectValues.defaultDescription'),
    value: undefined,
  },
  ...Object.values(Currencies).map((value) => ({
    label: translate(`settings.currencySelectValues.${value.currencyCode}` as LangKey),
    textRight: value.currencySymbol,
    value: value.currencyCode,
  })),
]

export default function Page() {
  const defaultStyles = useDefaultStyles()
  const colors = useColors()
  const [dangerZoneActive, setDangerZoneActive] = useState(false)

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
    [colors, defaultStyles]
  )

  const languageSelect = useSelectField<string | undefined>({
    modalTitle: translate('settings.languageSelectTitle'),
    options: languageOptions,
    value: language,
  })
  const currencySelect = useSelectField<CurrencyKeys | undefined>({
    modalTitle: translate('settings.currencySelectTitle'),
    options: currencyOptions,
    value: currencyCode,
  })
  const themeSelect = useSelectField<ColorSchemeName>({
    modalTitle: translate('settings.themeSelectTitle'),
    options: [
      {
        label: translate('settings.themeSelectValues.undefined'),
        description: translate('settings.themeSelectValues.defaultDescription'),
        value: undefined,
      },
      {
        label: translate('settings.themeSelectValues.light'),
        value: 'light',
      },
      {
        label: translate('settings.themeSelectValues.dark'),
        value: 'dark',
      },
    ],
    value: theme,
  })

  return (
    <GestureHandlerRootView style={[defaultStyles.pageContainer, { paddingHorizontal: 0 }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={styles.sectionTitle}>General</Text>

        <languageSelect.SelectField
          renderField={({ selectedValue, onOpen }) => (
            <Button
              size='large'
              onPress={onOpen}
              IconStart={<LanguagesIcon size={16} stroke={colors.textMuted} />}
              variant='text'>
              <View>
                <Text style={defaultStyles.bodyText}>
                  {translate('settings.languageOptionTitle')}
                </Text>
                <Text style={defaultStyles.detailSmall}>
                  {translate('settings.languageOptionDescription', {
                    language: translate(
                      `settings.languageSelectValues.${selectedValue?.value}` as LangKey
                    ),
                  })}
                </Text>
              </View>
            </Button>
          )}
        />
        <currencySelect.SelectField
          renderField={({ selectedValue, onOpen }) => (
            <Button
              size='large'
              onPress={onOpen}
              IconStart={<CoinsIcon size={16} stroke={colors.textMuted} />}
              variant='text'>
              <View>
                <Text style={defaultStyles.bodyText}>
                  {translate('settings.currencyOptionTitle')}
                </Text>
                <Text style={defaultStyles.detailSmall}>
                  {translate('settings.currencyOptionDescription', {
                    currency: translate(
                      `settings.currencySelectValues.${selectedValue?.value}` as LangKey
                    ),
                  })}
                </Text>
              </View>
            </Button>
          )}
        />
        <themeSelect.SelectField
          renderField={({ selectedValue, onOpen }) => (
            <Button
              size='large'
              onPress={onOpen}
              IconStart={<SunIcon size={16} stroke={colors.textMuted} />}
              variant='text'>
              <View>
                <Text style={defaultStyles.bodyText}>{translate('settings.themeOptionTitle')}</Text>
                <Text style={defaultStyles.detailSmall}>
                  {translate('settings.themeOptionDescription', {
                    theme: translate(
                      `settings.themeSelectValues.${selectedValue?.value}` as LangKey
                    ),
                  })}
                </Text>
              </View>
            </Button>
          )}
        />

        <Text style={styles.sectionTitle}>Data</Text>
        <Button
          size='large'
          IconStart={<UploadIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Export</Text>
            <Text style={defaultStyles.detailSmall}>Export data to a file</Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<DownloadIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Import</Text>
            <Text style={defaultStyles.detailSmall}>Import data from a given CSV file</Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<CloudIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Sync</Text>
            <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>
              Sync your data to a Google Drive or Onedrive location. (Changes on the drive will not
              be registered by the app and overwritten after each sync)
            </Text>
          </View>
        </Button>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <Button
          size='large'
          disabled
          IconStart={<WaypointsIcon size={16} stroke={colors.positive} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Status</Text>
            <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>
              No permissions to send notification | Next reminder on 26th November 2024 10.00 am
            </Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<BellIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Enable reminder</Text>
            <Text style={defaultStyles.detailSmall}>
              A regular reminder to write down new readings
            </Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<CalendarDaysIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Reminder Interval</Text>
            <Text style={defaultStyles.detailSmall}>Weekly | Sunday | 10 am</Text>
          </View>
        </Button>
        <Text style={styles.sectionTitle}>Support</Text>
        <Button
          size='large'
          IconStart={<MessageSquareReplyIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Send Feedback</Text>
            <Text style={defaultStyles.detailSmall}>
              Any feedback is appreciated and will be read by the developers
            </Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<BugIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Report issues</Text>
            <Text style={defaultStyles.detailSmall}>
              Found a bug? Report it here and we will fix it as soon as possible
            </Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<StarIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Rate the app</Text>
            <Text style={defaultStyles.detailSmall}>
              Like the app? Rate it on the store and leave a review
            </Text>
          </View>
        </Button>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Button
          size='large'
          onPress={() => {
            if (dangerZoneActive) {
              setDangerZoneActive(false)
              return
            }
            Alert.alert('Activate Dangerzone', 'Only activate if you know what you are doing', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Activate',
                style: 'destructive',
                onPress: () => {
                  setDangerZoneActive(true)
                },
              },
            ])
          }}
          IconStart={<ShieldAlertIcon size={16} stroke={colors.negative} />}
          variant='text'>
          <View>
            <Text style={[defaultStyles.bodyText, { color: colors.negative }]}>
              {!dangerZoneActive ? 'Activate Dangerzone' : 'Disable Dangerzone'}
            </Text>
            <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>
              Only activate if you know what you are doing
            </Text>
          </View>
        </Button>
        <Button
          size='large'
          disabled={!dangerZoneActive}
          IconStart={
            <RefreshCcwIcon
              size={16}
              stroke={colors.textMuted}
              opacity={!dangerZoneActive ? 0.6 : 1}
            />
          }
          variant='text'>
          <View style={[!dangerZoneActive && { opacity: 0.6 }]}>
            <Text
              style={[defaultStyles.bodyText, !dangerZoneActive && { color: colors.textMuted }]}>
              Reset
            </Text>
            <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>
              Reset the data on your device, this will delete your data permanently
            </Text>
          </View>
        </Button>
      </ScrollView>
      <languageSelect.SelectFieldSheet
        ListHeaderComponent={
          <View
            style={[
              defaultStyles.row,
              {
                marginTop: 4,
                marginBottom: 4,
                borderLeftWidth: 1,
                borderColor: colors.warning,
                paddingRight: 32,
                paddingLeft: 8,
                gap: 8,
              },
            ]}>
            <TriangleAlertIcon size={16} stroke={colors.warning} />
            <Text style={[defaultStyles.detailSmall, { color: colors.warning, lineHeight: 14 }]}>
              {translate('settings.languageChangeWarning')}
            </Text>
          </View>
        }
      />
      <currencySelect.SelectFieldSheet />
      <themeSelect.SelectFieldSheet />
    </GestureHandlerRootView>
  )
}
