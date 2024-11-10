import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import { Link } from 'expo-router'
import {
  BellIcon,
  BugIcon,
  CalendarDaysIcon,
  CloudIcon,
  CoinsIcon,
  DownloadIcon,
  LanguagesIcon,
  LayoutDashboardIcon,
  LockIcon,
  MessageSquareReplyIcon,
  OmegaIcon,
  RefreshCcwIcon,
  Settings2Icon,
  ShieldAlertIcon,
  StarIcon,
  SunIcon,
  Trash2Icon,
  UploadIcon,
  WaypointsIcon,
} from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Button } from '@/lib/components/Button'
import { deleteReading } from '@/modules/readings/readings.query'
import {
  HeaderBackButton,
  makeHeaderBackButton,
  makeHeaderDialogBackButton,
} from '@/lib/components/header/HeaderBackButton'
import { HeaderButtonsWithEdit } from '@/lib/components/header/HeaderButtons'

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

  return (
    <View style={[defaultStyles.pageContainer, { paddingHorizontal: 0 }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={styles.sectionTitle}>General</Text>

        <Button
          size='large'
          IconStart={<LanguagesIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Language</Text>
            <Text style={defaultStyles.detailSmall}>Currently selected: German</Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<CoinsIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Currency</Text>
            <Text style={defaultStyles.detailSmall}>Currently selected: Eur (€)</Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<SunIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Theme</Text>
            <Text style={defaultStyles.detailSmall}>Currently selected: System</Text>
          </View>
        </Button>
        <Button
          size='large'
          IconStart={<LockIcon size={16} stroke={colors.textMuted} />}
          variant='text'>
          <View>
            <Text style={defaultStyles.bodyText}>Screen Saver</Text>
            <Text style={defaultStyles.detailSmall}>Prevent Screen Saver from turning on</Text>
          </View>
        </Button>

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
          IconStart={<WaypointsIcon size={16} stroke={colors.textMuted} />}
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
    </View>
  )
}
