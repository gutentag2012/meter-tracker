import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/settings/settings.signals'
import {
  StorageKeys,
} from '@/modules/general/constants'
import { migrateOldDb } from '@/database/migrateOldDb'

AsyncStorage.getItem(StorageKeys.didMigrateOldDB)
  .then(async (didMigrateOldDbFromStorage) => {
    console.log('Loaded dbMigrateOldDB', didMigrateOldDbFromStorage)
    if(!!didMigrateOldDbFromStorage) {
      console.log('Already migrated old db')
      numberOfSettingsLoaded.value++
      return;
    }

    await migrateOldDb()
    // TODO Store that we migrated the old db
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading dbMigrateOldDB', err))
