import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/settings/settings.signals'
import {
  StorageKeys,
} from '@/modules/general/constants'
import { migrateOldDb } from '@/database/migrateOldDb'
import { db } from '@/database/db'
import { reading } from '@/database/schema'
import { sql } from 'drizzle-orm'

AsyncStorage.getItem(StorageKeys.didMigrateOldDB)
  .then(async (didMigrateOldDbFromStorage) => {
    console.log('Loaded dbMigrateOldDB', didMigrateOldDbFromStorage)
    const currentReadingLength = await db.select({
      length: sql<number>`count(*)`.as('length'),
    }).from(reading)
    const amountOfReadings = currentReadingLength[0].length ?? 0
    if(!!didMigrateOldDbFromStorage && amountOfReadings > 0) {
      console.log('Already migrated old db')
      numberOfSettingsLoaded.value++
      return;
    }

    await migrateOldDb()
    await AsyncStorage.setItem(StorageKeys.didMigrateOldDB, 'true')
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading dbMigrateOldDB', err))
