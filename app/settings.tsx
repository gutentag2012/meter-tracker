import {
  Alert,
  ColorSchemeName,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack } from 'expo-router/stack'
import {
  BellIcon,
  CalendarDaysIcon,
  CheckSquare2Icon,
  CloudIcon,
  CoinsIcon,
  DownloadIcon,
  LanguagesIcon,
  RefreshCcwIcon,
  ShieldAlertIcon,
  SquareIcon,
  SunIcon,
  TriangleAlertIcon,
  UploadIcon,
  WaypointsIcon,
} from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/modules/general/components/inputs/Button'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { currencyCode } from '@/modules/settings/currency.signals'
import { useSelectField } from '@/modules/general/components/inputs/SelectField'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useForm } from '@formsignals/form-react'
import { configureZodAdapter } from '@formsignals/validation-adapter-zod'
import { translate } from '@/modules/general/translations'
import { LangKey } from '@/modules/general/translations/en'
import {
  Currencies,
  CurrencyKeys,
  Languages,
} from '@/modules/general/constants'
import {
  colorScheme,
  useColors,
  useDefaultStyles,
} from '@/modules/general/theme'
import {
  interval,
  reminderEnabled,
} from '@/modules/settings/notification.signals'
import { PermissionStatus } from 'expo-notifications'
import { language } from '@/modules/settings/language.signals'
import { translateInterval } from '@/modules/settings/notifications'
import { IntervalForm } from '@/modules/settings/components/IntervalForm'
import { resetDatabase } from '@/database/db'
import { useSignals } from '@preact/signals-react/runtime'
import { Checkbox } from '@/modules/general/components/inputs/Checkbox'

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
    label: translate(
      `settings.currencySelectValues.${value.currencyCode}` as LangKey,
    ),
    textRight: value.currencySymbol,
    value: value.currencyCode,
  })),
]

export default function Page() {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const reminderIntervalRef = useRef<BottomSheetModal>(null)
  const [dangerZoneActive, setDangerZoneActive] = useState(false)

  const intervalForm = useForm({
    validatorAdapter: configureZodAdapter({
      takeFirstError: true,
    }),
    defaultValues: interval.value,
    onSubmit: (values) => {
      interval.value = values
      reminderIntervalRef.current?.dismiss()
    },
  })

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    ),
    [],
  )

  const [areNotificationsGranted, setAreNotificationsGranted] = useState(
    PermissionStatus.DENIED,
  )
  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((status) => {
        setAreNotificationsGranted(status.status)
      })
      .catch((err) => {
        console.error('Error getting notification permissions', err)
      })
  }, [])

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
    value: colorScheme,
  })

  return (
    <GestureHandlerRootView
      style={[defaultStyles.pageContainer, { paddingHorizontal: 0 }]}
    >
      <Stack.Screen
        options={{
          title: translate('pages.settings'),
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
      >
        <Text style={styles.sectionTitle}>
          {translate('settings.headerGeneral')}
        </Text>

        <languageSelect.SelectField
          renderField={({ selectedValue, onOpen }) => (
            <Button
              size="large"
              onPress={onOpen}
              IconStart={<LanguagesIcon size={16} stroke={colors.textMuted} />}
              variant="text"
            >
              <View>
                <Text style={defaultStyles.bodyText}>
                  {translate('settings.languageOptionTitle')}
                </Text>
                <Text style={defaultStyles.detailSmall}>
                  {translate('settings.languageOptionDescription', {
                    language: translate(
                      `settings.languageSelectValues.${selectedValue?.value}` as LangKey,
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
              size="large"
              onPress={onOpen}
              IconStart={<CoinsIcon size={16} stroke={colors.textMuted} />}
              variant="text"
            >
              <View>
                <Text style={defaultStyles.bodyText}>
                  {translate('settings.currencyOptionTitle')}
                </Text>
                <Text style={defaultStyles.detailSmall}>
                  {translate('settings.currencyOptionDescription', {
                    currency: translate(
                      `settings.currencySelectValues.${selectedValue?.value}` as LangKey,
                    ),
                  })}
                </Text>
              </View>
            </Button>
          )}
        />
        {/*<themeSelect.SelectField*/}
        {/*  renderField={({ selectedValue, onOpen }) => (*/}
        {/*    <Button*/}
        {/*      size="large"*/}
        {/*      onPress={onOpen}*/}
        {/*      IconStart={<SunIcon size={16} stroke={colors.textMuted} />}*/}
        {/*      variant="text"*/}
        {/*    >*/}
        {/*      <View>*/}
        {/*        <Text style={defaultStyles.bodyText}>*/}
        {/*          {translate('settings.themeOptionTitle')}*/}
        {/*        </Text>*/}
        {/*        <Text style={defaultStyles.detailSmall}>*/}
        {/*          {translate('settings.themeOptionDescription', {*/}
        {/*            theme: translate(*/}
        {/*              `settings.themeSelectValues.${selectedValue?.value}` as LangKey,*/}
        {/*            ),*/}
        {/*          })}*/}
        {/*        </Text>*/}
        {/*      </View>*/}
        {/*    </Button>*/}
        {/*  )}*/}
        {/*/>*/}

        <Text style={styles.sectionTitle}>
          {translate('settings.headerData')}
        </Text>
        <Button
          onPress={() => router.push('/export')}
          size="large"
          IconStart={<UploadIcon size={16} stroke={colors.textMuted} />}
          variant="text"
        >
          <View>
            <Text style={defaultStyles.bodyText}>
              {translate('settings.exportOptionTitle')}
            </Text>
            <Text style={defaultStyles.detailSmall}>
              {translate('settings.exportOptionDescription')}
            </Text>
          </View>
        </Button>
        <Button
          onPress={() => router.push('/import')}
          size="large"
          IconStart={<DownloadIcon size={16} stroke={colors.textMuted} />}
          variant="text"
        >
          <View>
            <Text style={defaultStyles.bodyText}>
              {translate('settings.importOptionTitle')}
            </Text>
            <Text style={defaultStyles.detailSmall}>
              {translate('settings.importOptionDescription')}
            </Text>
          </View>
        </Button>
        {/*<Button*/}
        {/*  size='large'*/}
        {/*  IconStart={<CloudIcon size={16} stroke={colors.textMuted} />}*/}
        {/*  variant='text'>*/}
        {/*  <View>*/}
        {/*    <Text style={defaultStyles.bodyText}>Sync</Text>*/}
        {/*    <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>*/}
        {/*      Sync your data to a Google Drive or Onedrive location. (Changes on the drive will not*/}
        {/*      be registered by the app and overwritten after each sync)*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
        <Text style={styles.sectionTitle}>
          {translate('settings.headerReminder')}
        </Text>
        <Button
          size="large"
          disabled
          IconStart={
            <WaypointsIcon
              size={16}
              stroke={
                areNotificationsGranted === PermissionStatus.GRANTED
                  ? colors.positive
                  : areNotificationsGranted === PermissionStatus.DENIED
                    ? colors.negative
                    : colors.warning
              }
            />
          }
          variant="text"
        >
          <View>
            <Text style={defaultStyles.bodyText}>
              {translate('settings.reminderStatusOptionTitle')}
            </Text>
            <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>
              {areNotificationsGranted === PermissionStatus.GRANTED
                ? translate('settings.reminderStatusOptionDescriptionGranted')
                : areNotificationsGranted === PermissionStatus.DENIED
                  ? translate('settings.reminderStatusOptionDescriptionDenied')
                  : translate(
                      'settings.reminderStatusOptionDescriptionUndetermined',
                    )}
            </Text>
          </View>
        </Button>
        <Button
          size="large"
          onPress={() => {
            reminderEnabled.value = !reminderEnabled.peek()
          }}
          IconStart={<BellIcon size={16} stroke={colors.textMuted} />}
          variant="text"
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 1,
              paddingRight: 16,
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={defaultStyles.bodyText}>
                {translate('settings.enableReminderTitle')}
              </Text>
              <Text style={defaultStyles.detailSmall}>
                {translate('settings.enableReminderDescription')}
              </Text>
            </View>
            <Checkbox isChecked={reminderEnabled.value} />
          </View>
        </Button>
        <Button
          size="large"
          disabled={!reminderEnabled.value}
          IconStart={
            <CalendarDaysIcon
              size={16}
              stroke={colors.textMuted}
              opacity={!reminderEnabled.value ? 0.6 : 1}
            />
          }
          variant="text"
          onPress={() => reminderIntervalRef.current?.present()}
        >
          <View style={{ opacity: !reminderEnabled.value ? 0.6 : 1 }}>
            <Text style={defaultStyles.bodyText}>
              {translate('settings.reminderIntervalTitle')}
            </Text>
            <Text style={defaultStyles.detailSmall}>
              {translateInterval(interval.value)}
            </Text>
          </View>
        </Button>
        {/*<Text style={styles.sectionTitle}>Support</Text>*/}
        {/*<Button*/}
        {/*  size='large'*/}
        {/*  IconStart={<MessageSquareReplyIcon size={16} stroke={colors.textMuted} />}*/}
        {/*  variant='text'>*/}
        {/*  <View>*/}
        {/*    <Text style={defaultStyles.bodyText}>Send Feedback</Text>*/}
        {/*    <Text style={defaultStyles.detailSmall}>*/}
        {/*      Any feedback is appreciated and will be read by the developers*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
        {/*<Button*/}
        {/*  size='large'*/}
        {/*  IconStart={<BugIcon size={16} stroke={colors.textMuted} />}*/}
        {/*  variant='text'>*/}
        {/*  <View>*/}
        {/*    <Text style={defaultStyles.bodyText}>Report issues</Text>*/}
        {/*    <Text style={defaultStyles.detailSmall}>*/}
        {/*      Found a bug? Report it here and we will fix it as soon as possible*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
        {/*<Button*/}
        {/*  size='large'*/}
        {/*  IconStart={<StarIcon size={16} stroke={colors.textMuted} />}*/}
        {/*  variant='text'>*/}
        {/*  <View>*/}
        {/*    <Text style={defaultStyles.bodyText}>Rate the app</Text>*/}
        {/*    <Text style={defaultStyles.detailSmall}>*/}
        {/*      Like the app? Rate it on the store and leave a review*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
        {/*<Text style={styles.sectionTitle}>*/}
        {/*  {translate('settings.headerDangerZone')}*/}
        {/*</Text>*/}
        {/*<Button*/}
        {/*  size="large"*/}
        {/*  onPress={() => {*/}
        {/*    if (dangerZoneActive) {*/}
        {/*      setDangerZoneActive(false)*/}
        {/*      return*/}
        {/*    }*/}
        {/*    Alert.alert(*/}
        {/*      translate('settings.dangerZoneAlertTitle'),*/}
        {/*      translate('settings.dangerZoneAlertDescription'),*/}
        {/*      [*/}
        {/*        {*/}
        {/*          text: translate('general.cancel'),*/}
        {/*          style: 'cancel',*/}
        {/*        },*/}
        {/*        {*/}
        {/*          text: translate('general.activate'),*/}
        {/*          style: 'destructive',*/}
        {/*          onPress: () => {*/}
        {/*            setDangerZoneActive(true)*/}
        {/*          },*/}
        {/*        },*/}
        {/*      ],*/}
        {/*    )*/}
        {/*  }}*/}
        {/*  IconStart={<ShieldAlertIcon size={16} stroke={colors.negative} />}*/}
        {/*  variant="text"*/}
        {/*>*/}
        {/*  <View>*/}
        {/*    <Text style={[defaultStyles.bodyText, { color: colors.negative }]}>*/}
        {/*      {!dangerZoneActive*/}
        {/*        ? translate('settings.activateDangerZoneTitle')*/}
        {/*        : translate('settings.activateDangerZoneTitleDisable')}*/}
        {/*    </Text>*/}
        {/*    <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>*/}
        {/*      {translate('settings.activateDangerZoneDescription')}*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
        {/*<Button*/}
        {/*  size="large"*/}
        {/*  disabled={!dangerZoneActive}*/}
        {/*  IconStart={*/}
        {/*    <RefreshCcwIcon*/}
        {/*      size={16}*/}
        {/*      stroke={colors.textMuted}*/}
        {/*      opacity={!dangerZoneActive ? 0.6 : 1}*/}
        {/*    />*/}
        {/*  }*/}
        {/*  variant="text"*/}
        {/*  onPress={() => resetDatabase()}*/}
        {/*>*/}
        {/*  <View style={[!dangerZoneActive && { opacity: 0.6 }]}>*/}
        {/*    <Text*/}
        {/*      style={[*/}
        {/*        defaultStyles.bodyText,*/}
        {/*        !dangerZoneActive && { color: colors.textMuted },*/}
        {/*      ]}*/}
        {/*    >*/}
        {/*      {translate('settings.resetOptionTitle')}*/}
        {/*    </Text>*/}
        {/*    <Text style={[defaultStyles.detailSmall, { maxWidth: '95%' }]}>*/}
        {/*      {translate('settings.resetOptionDescription')}*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</Button>*/}
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
            ]}
          >
            <TriangleAlertIcon size={16} stroke={colors.warning} />
            <Text
              style={[
                defaultStyles.detailSmall,
                { color: colors.warning, lineHeight: 14 },
              ]}
            >
              {translate('settings.languageChangeWarning')}
            </Text>
          </View>
        }
      />
      <currencySelect.SelectFieldSheet />
      <themeSelect.SelectFieldSheet />

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={reminderIntervalRef}
          index={0}
          backdropComponent={renderBackdrop}
          snapPoints={['80%']}
          enableDynamicSizing={false}
          keyboardBehavior="fillParent"
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.text }}
        >
          <BottomSheetScrollView
            style={{ flex: 1, minHeight: 500, paddingHorizontal: 16 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 4,
                gap: 8,
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Text style={defaultStyles.cardTitle}>
                {translate('settings.reminderIntervalTitle')}
              </Text>
              <TouchableOpacity
                disabled={!intervalForm.canSubmit.value}
                style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}
                onPress={() => {
                  void intervalForm.handleSubmit()
                }}
              >
                <Text style={[defaultStyles.detail, { color: colors.primary }]}>
                  {translate('general.save')}
                </Text>
              </TouchableOpacity>
            </View>
            <IntervalForm form={intervalForm} />
          </BottomSheetScrollView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
