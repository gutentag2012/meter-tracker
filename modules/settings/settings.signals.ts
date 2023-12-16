import { batch, type Signal, signal } from '@preact/signals-react'
import {
  currentlyLoadedResources,
  SETTING_RESOURCE__ENABLE_REMINDER,
  SETTING_RESOURCE__FEATURE_FLAG_MULTIPLE_BUILDINGS,
  SETTING_RESOURCE__REMINDER_INTERVAL,
} from '@utils/AppResources'
import {
  type AsyncStorageKey,
  type AsyncStorageTypes,
  getAsyncValue,
  setAsyncValue,
} from '@utils/AsyncStorageUtils'
import { DefaultIntervalSetting } from '@utils/IntervalUtils'

type SettingsKeys = Exclude<AsyncStorageKey, 'DATABASE_VERSION'>

type AsyncSettingSignal<T> = {
  content: Signal<T | undefined>
  isLoading: Signal<boolean>
}

export const settings: {
  [Key in SettingsKeys]: AsyncSettingSignal<AsyncStorageTypes[Key]>
} = {
  ENABLE_REMINDER: { content: signal(undefined), isLoading: signal(true) },
  REMINDER_INTERVAL: { content: signal(undefined), isLoading: signal(true) },

  FEATURE_FLAG_MULTIPLE_BUILDINGS: { content: signal(undefined), isLoading: signal(true) },
}

export const SettingsDefaultValue = {
  ENABLE_REMINDER: false,
  REMINDER_INTERVAL: DefaultIntervalSetting,
  FEATURE_FLAG_MULTIPLE_BUILDINGS: false,
}

export const resetSettings = async () => {
  for (const settingsKey of Object.keys(settings) as Array<keyof typeof settings>) {
    await setSetting(settingsKey, SettingsDefaultValue[settingsKey])
  }
}

const ResourceValues = {
  ENABLE_REMINDER: SETTING_RESOURCE__ENABLE_REMINDER,
  REMINDER_INTERVAL: SETTING_RESOURCE__REMINDER_INTERVAL,
  FEATURE_FLAG_MULTIPLE_BUILDINGS: SETTING_RESOURCE__FEATURE_FLAG_MULTIPLE_BUILDINGS,
}

// Load all settings signals initially
for (const settingsKey of Object.keys(SettingsDefaultValue) as Array<SettingsKeys>) {
  const setting = settings[settingsKey]

  // Get initial value
  getAsyncValue(settingsKey).then((foundValue) => {
    currentlyLoadedResources.value |= ResourceValues[settingsKey]

    const value = foundValue ?? SettingsDefaultValue[settingsKey]
    console.log(
      `Got initial settings value for "${settingsKey}" with value`,
      value,
      'currently has',
      setting.content.peek()
    )

    batch(() => {
      setting.content.value = value
      setting.isLoading.value = false
    })
  })
}

export const setSetting = async <Key extends SettingsKeys>(
  key: Key,
  value?: AsyncStorageTypes[Key]
) => {
  console.log(`Saving settings value for "${key}" with value`, value)
  batch(() => {
    settings[key].isLoading.value = true
    settings[key].content.value = value
  })

  await setAsyncValue(key, value).catch((err) => console.error(err))
  console.log(`Saved settings value for "${key}" with value`, value)

  settings[key].isLoading.value = false
}
