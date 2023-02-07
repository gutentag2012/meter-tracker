import './setup'

import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ButtonProps, Colors, ThemeManager } from 'react-native-ui-lib'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import { setupDatabase } from './services/database'
import i18n from './services/i18n'

Colors.loadColors({
    primary100: '#FFFFFF',
    primary99: '#F7FFEE',
    primary95: '#CBFFB7',
    primary90: '#B0F499',
    primary80: '#95D780',
    primary70: '#7ABB67',
    primary60: '#60A04F',
    primary50: '#478538',
    primary40: '#2E6B21',
    primary30: '#145209',
    primary20: '#043900',
    primary10: '#012200',
    primary0: '#000000',

    secondary100: '#FFFFFF',
    secondary99: '#F7FFEE',
    secondary95: '#E5F6DA',
    secondary90: '#D7E8CC',
    secondary80: '#BBCBB1',
    secondary70: '#A0B097',
    secondary60: '#86957D',
    secondary50: '#6C7B65',
    secondary40: '#54634D',
    secondary30: '#3D4B37',
    secondary20: '#273422',
    secondary10: '#121F0E',
    secondary0: '#000000',

    tertiary100: '#FFFFFF',
    tertiary99: '#F2FFFF',
    tertiary95: '#CAFAFC',
    tertiary90: '#BCEBEE',
    tertiary80: '#A0CFD1',
    tertiary70: '#85B3B6',
    tertiary60: '#6B999B',
    tertiary50: '#517F81',
    tertiary40: '#386668',
    tertiary30: '#1E4D50',
    tertiary20: '#003739',
    tertiary10: '#002021',
    tertiary0: '#000000',

    error100: '#FFFFFF',
    error99: '#FFFBFF',
    error95: '#FFEDEA',
    error90: '#FFDAD6',
    error80: '#FFB4AB',
    error70: '#FF897D',
    error60: '#FF5449',
    error50: '#DE3730',
    error40: '#BA1A1A',
    error30: '#93000A',
    error20: '#690005',
    error10: '#410002',
    error0: '#000000',

    neutral100: '#FFFFFF',
    neutral99: '#FCFDF6',
    neutral95: '#F1F1EA',
    neutral90: '#E2E3DC',
    neutral80: '#C6C7C1',
    neutral70: '#ABACA6',
    neutral60: '#90918C',
    neutral50: '#767872',
    neutral40: '#5D5F5A',
    neutral30: '#454743',
    neutral20: '#2F312D',
    neutral10: '#1A1C18',
    neutral0: '#000000',

    neutralVariant100: '#FFFFFF',
    neutralVariant99: '#F9FEF1',
    neutralVariant95: '#EDF3E5',
    neutralVariant90: '#DFE4D7',
    neutralVariant80: '#C3C8BC',
    neutralVariant70: '#A7ADA1',
    neutralVariant60: '#8D9387',
    neutralVariant50: '#73796E',
    neutralVariant40: '#5A6056',
    neutralVariant30: '#43483F',
    neutralVariant20: '#2C3229',
    neutralVariant10: '#181D15',
    neutralVariant0: '#000000',

    surface1Light: '#F2F6EB',
    surface1Dark: '#20251D',
  },
)
Colors.loadSchemes({

    light: {
      primary: Colors.primary40,
      onPrimary: Colors.primary100,
      primaryContainer: Colors.primary90,
      onPrimaryContainer: Colors.primary10,

      secondary: Colors.secondary40,
      onSecondary: Colors.secondary100,
      secondaryContainer: Colors.secondary90,
      onSecondaryContainer: Colors.secondary10,

      tertiary: Colors.tertiary40,
      onTertiary: Colors.tertiary100,
      tertiaryContainer: Colors.tertiary90,
      onTertiaryContainer: Colors.tertiary10,

      error: Colors.error40,
      onError: Colors.error100,
      errorContainer: Colors.error90,
      onErrorContainer: Colors.error10,

      background: Colors.neutral99,
      onBackground: Colors.neutral10,

      surface: Colors.surface1Light,
      onSurface: Colors.neutral10,

      outline: Colors.neutralVariant50,
    },
    dark: {
      primary: Colors.primary80,
      onPrimary: Colors.primary20,
      primaryContainer: Colors.primary30,
      onPrimaryContainer: Colors.primary90,

      secondary: Colors.secondary80,
      onSecondary: Colors.secondary20,
      secondaryContainer: Colors.secondary30,
      onSecondaryContainer: Colors.secondary90,

      tertiary: Colors.tertiary80,
      onTertiary: Colors.tertiary20,
      tertiaryContainer: Colors.tertiary30,
      onTertiaryContainer: Colors.tertiary90,

      error: Colors.error80,
      onError: Colors.error20,
      errorContainer: Colors.error30,
      onErrorContainer: Colors.error90,

      background: Colors.neutral10,
      onBackground: Colors.neutral90,

      surface: Colors.surface1Dark,
      onSurface: Colors.neutral90,

      outline: Colors.neutralVariant60,
    },
  },
)

ThemeManager.setComponentForcedTheme('Button', (props: ButtonProps) => ({
  backgroundColor: props.outline ? 'transparent' : Colors.primary,
  primary: !!props.outline,
  onPrimary: !props.outline,
  borderColor: props.outline ? Colors.primary : 'transparent',
  outlineColor: props.outline ? Colors.primary : 'transparent',
}))

export default function App() {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  useEffect(() => {
    setupDatabase().then(() => console.log('Database setup complete'))

    i18n.init()
      // .then(() => {
      //   const RNDir = RNI18nManager.isRTL ? 'RTL' : 'LTR';
      //   // RN doesn't always correctly identify native
      //   // locale direction, so we force it here.
      //   if (i18n.dir !== RNDir) {
      //     const isLocaleRTL = i18n.dir === 'RTL';
      //     RNI18nManager.forceRTL(isLocaleRTL);
      //     // RN won't set the layout direction if we
      //     // don't restart the app's JavaScript.
      //     Updates.reloadFromCache();
      //   }
      // })
      .catch((error) => console.warn(error))
  }, [])

  if (!isLoadingComplete) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Navigation colorScheme={ colorScheme } />
      <StatusBar />
    </SafeAreaProvider>
  )
}
