import { t } from '@/i18n'
import { dailyUsagesForSelectedMeter } from '@/measurements/measurement.signals'
import {
  MeasurementDailyUsagePerDayChart,
  YearlyChunkSize,
} from '@/meters/components/charts/MeasurementDailyUsagePerDayChart'
import { MeasurementMonthlyHeatmap } from '@/meters/components/charts/MeasurementMonthlyHeatmap'
import { MeasurementTotalYearlyUsageChart } from '@/meters/components/charts/MeasurementTotalYearlyUsageChart'
import * as React from 'react'
import { useState } from 'react'
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabView } from 'react-native-tab-view'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { BackIcon } from '../components/icons/BackIcon'
import { EditIcon } from '../components/icons/EditIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { type HomeStackScreenProps } from '../navigation/types'
import { Typography } from '../setupTheme'
import { MeasurementList } from '@/measurements/components/MeasurementList'

const MeasurementDailyUsage = () => (
  <View>
    <Text style={styles.sectionTitle}>{t('meter:usage_per_day')}</Text>
    <MeasurementDailyUsagePerDayChart />
  </View>
)

const MeasurementTotalUsage = () => (
  <View>
    <Text style={styles.sectionTitle}>{t('meter:usage_per_year')}</Text>
    <MeasurementTotalYearlyUsageChart />
  </View>
)

const MonthlyHeatmap = () => (
  <View>
    <Text style={styles.sectionTitle}>{t('meter:heatmap_of_usage')}</Text>
    <MeasurementMonthlyHeatmap />
  </View>
)

const renderScene = SceneMap({
  yearlyDailyUsage: MeasurementDailyUsage,
  yearlyTotalUsage: MeasurementTotalUsage,
  monthlyHeatmap: MonthlyHeatmap,
})

const routes = [
  {
    key: 'yearlyDailyUsage',
  },
  {
    key: 'yearlyTotalUsage',
  },
  {
    key: 'monthlyHeatmap',
  },
]

export default function MeterSummaryScreen({
  navigation,
  route,
}: HomeStackScreenProps<'MeterSummaryScreen'>) {
  const layout = useWindowDimensions()
  const [index, setIndex] = useState(0)

  // The height modifier is only used in the first screen, since it can have an overflow of years
  const bottomHeightModifier =
    index === 0 ? Math.ceil((dailyUsagesForSelectedMeter.value.length || 1) / YearlyChunkSize) : 1

  return (
    <SafeAreaView style={styles.container} bg-backgroundColor>
      <AppBar
        title={route.params.meter.name}
        leftAction={
          <>
            <IconButton
              style={{ marginRight: 8 }}
              getIcon={() => <BackIcon color={Colors.onBackground} />}
              onPress={() => navigation.pop()}
            />
          </>
        }
        actions={
          <>
            <IconButton
              getIcon={() => <EditIcon color={Colors.onBackground} />}
              onPress={() =>
                navigation.navigate('AddMeterModal', {
                  editMeter: route.params.meter,
                })
              }
            />
            <IconButton
              getIcon={() => <SettingsIcon color={Colors.onBackground} />}
              onPress={() => navigation.navigate('SettingsScreen')}
            />
          </>
        }
      />

      <View
        style={{
          height: Dimensions.get('window').width * 0.6 + 40 + 26 * bottomHeightModifier,
        }}
      >
        <TabView
          navigationState={{
            index,
            routes,
          }}
          overScrollMode="always"
          tabBarPosition="bottom"
          renderTabBar={(props) => {
            const inputRange = props.navigationState.routes.map((x, i) => i)

            return (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {props.navigationState.routes.map((route, i) => {
                  const opacity = props.position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 0.25)),
                  })
                  const size = props.position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 6 : 4)),
                  })

                  return (
                    <TouchableOpacity
                      key={route.key}
                      style={{
                        padding: 8,
                      }}
                      onPress={() => setIndex(i)}
                    >
                      <Animated.View
                        style={[
                          {
                            transform: [{ scale: size }],
                            width: 1,
                            height: 1,
                            backgroundColor: Colors.onBackground,
                            borderRadius: 8,
                          },
                          { opacity },
                        ]}
                      />
                    </TouchableOpacity>
                  )
                })}
              </View>
            )
          }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>

      <MeasurementList navigation={navigation} />

      <GlobalToast
        renderAttachment={() => (
          <FloatingActionButton
            icon={AddIcon}
            onPress={() =>
              navigation.navigate('AddMeasurementModal', { meter: route.params.meter })
            }
          />
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    color: Colors.onBackground,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
