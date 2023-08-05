import { TextStyle } from 'react-native'
import { Colors } from 'react-native-ui-lib'

const Theme = {
  'seed': '#33A4B8',
  'description': 'TYPE: CUSTOM',
  'coreColors': {
    'primary': '#33A4B8',
  },
  'schemes': {
    'light': {
      'primary': '#006877',
      'onPrimary': '#FFFFFF',
      'primaryContainer': '#A3EEFF',
      'onPrimaryContainer': '#001F25',
      'primaryFixed': '#A3EEFF',
      'onPrimaryFixed': '#001F25',
      'primaryFixedDim': '#52D7F0',
      'onPrimaryFixedVariant': '#004E5A',
      'secondary': '#4A6268',
      'onSecondary': '#FFFFFF',
      'secondaryContainer': '#CDE7ED',
      'onSecondaryContainer': '#051F24',
      'secondaryFixed': '#CDE7ED',
      'onSecondaryFixed': '#051F24',
      'secondaryFixedDim': '#B2CBD1',
      'onSecondaryFixedVariant': '#334A50',
      'tertiary': '#545D7E',
      'onTertiary': '#FFFFFF',
      'tertiaryContainer': '#DCE1FF',
      'onTertiaryContainer': '#111A37',
      'tertiaryFixed': '#DCE1FF',
      'onTertiaryFixed': '#111A37',
      'tertiaryFixedDim': '#BCC5EB',
      'onTertiaryFixedVariant': '#3D4665',
      'error': '#BA1A1A',
      'onError': '#FFFFFF',
      'errorContainer': '#FFDAD6',
      'onErrorContainer': '#410002',
      'outline': '#6F797B',
      'background': '#FBFCFD',
      'onBackground': '#191C1D',
      'surface': '#F8FAFA',
      'onSurface': '#191C1D',
      'surfaceVariant': '#DBE4E7',
      'onSurfaceVariant': '#3F484B',
      'inverseSurface': '#2E3132',
      'inverseOnSurface': '#EFF1F2',
      'inversePrimary': '#52D7F0',
      'shadow': '#000000',
      'surfaceTint': '#006877',
      'outlineVariant': '#BFC8CB',
      'scrim': '#000000',
      'surfaceContainerHighest': '#E1E3E3',
      'surfaceContainerHigh': '#E6E8E9',
      'surfaceContainer': '#ECEEEF',
      'surfaceContainerLow': '#F2F4F5',
      'surfaceContainerLowest': '#FFFFFF',
      'surfaceBright': '#F8FAFA',
      'surfaceDim': '#D8DADB',
    },
    'dark': {
      'primary': '#52D7F0',
      'onPrimary': '#00363E',
      'primaryContainer': '#004E5A',
      'onPrimaryContainer': '#A3EEFF',
      'primaryFixed': '#A3EEFF',
      'onPrimaryFixed': '#001F25',
      'primaryFixedDim': '#52D7F0',
      'onPrimaryFixedVariant': '#004E5A',
      'secondary': '#B2CBD1',
      'onSecondary': '#1C3439',
      'secondaryContainer': '#334A50',
      'onSecondaryContainer': '#CDE7ED',
      'secondaryFixed': '#CDE7ED',
      'onSecondaryFixed': '#051F24',
      'secondaryFixedDim': '#B2CBD1',
      'onSecondaryFixedVariant': '#334A50',
      'tertiary': '#BCC5EB',
      'onTertiary': '#262F4D',
      'tertiaryContainer': '#3D4665',
      'onTertiaryContainer': '#DCE1FF',
      'tertiaryFixed': '#DCE1FF',
      'onTertiaryFixed': '#111A37',
      'tertiaryFixedDim': '#BCC5EB',
      'onTertiaryFixedVariant': '#3D4665',
      'error': '#FFB4AB',
      'onError': '#690005',
      'errorContainer': '#93000A',
      'onErrorContainer': '#FFDAD6',
      'outline': '#899295',
      'background': '#191C1D',
      'onBackground': '#E1E3E3',
      'surface': '#111415',
      'onSurface': '#C4C7C8',
      'surfaceVariant': '#3F484B',
      'onSurfaceVariant': '#BFC8CB',
      'inverseSurface': '#E1E3E3',
      'inverseOnSurface': '#191C1D',
      'inversePrimary': '#006877',
      'shadow': '#000000',
      'surfaceTint': '#52D7F0',
      'outlineVariant': '#3F484B',
      'scrim': '#000000',
      'surfaceContainerHighest': '#323536',
      'surfaceContainerHigh': '#272A2B',
      'surfaceContainer': '#1D2021',
      'surfaceContainerLow': '#191C1D',
      'surfaceContainerLowest': '#0B0F10',
      'surfaceBright': '#363A3B',
      'surfaceDim': '#111415',
    },
  },
  'palettes': {
    'primary': {
      '0': '#000000',
      '5': '#001418',
      '10': '#001F25',
      '15': '#022D00',
      '20': '#00363E',
      '25': '#00424C',
      '30': '#004E5A',
      '35': '#005B68',
      '40': '#006877',
      '50': '#008395',
      '60': '#009FB5',
      '70': '#27BBD3',
      '80': '#52D7F0',
      '90': '#A3EEFF',
      '95': '#D5F7FF',
      '98': '#EFFCFF',
      '99': '#F7FDFF',
      '100': '#FFFFFF',
    },
    'secondary': {
      '0': '#000000',
      '5': '#001418',
      '10': '#051F24',
      '15': '#1C2918',
      '20': '#1C3439',
      '25': '#283F44',
      '30': '#334A50',
      '35': '#3F565C',
      '40': '#4A6268',
      '50': '#637B81',
      '60': '#7C959B',
      '70': '#97B0B6',
      '80': '#B2CBD1',
      '90': '#CDE7ED',
      '95': '#DBF5FC',
      '98': '#EFFCFF',
      '99': '#F7FDFF',
      '100': '#FFFFFF',
    },
    'tertiary': {
      '0': '#000000',
      '5': '#050F2C',
      '10': '#111A37',
      '15': '#002B2D',
      '20': '#262F4D',
      '25': '#313A59',
      '30': '#3D4665',
      '35': '#485171',
      '40': '#545D7E',
      '50': '#6D7698',
      '60': '#878FB3',
      '70': '#A1AACE',
      '80': '#BCC5EB',
      '90': '#DCE1FF',
      '95': '#EFF0FF',
      '98': '#FAF8FF',
      '99': '#FEFBFF',
      '100': '#FFFFFF',
    },
    'error': {
      '0': '#000000',
      '5': '#2D0001',
      '10': '#410002',
      '15': '#540003',
      '20': '#690005',
      '25': '#7E0007',
      '30': '#93000A',
      '35': '#A80710',
      '40': '#BA1A1A',
      '50': '#DE3730',
      '60': '#FF5449',
      '70': '#FF897D',
      '80': '#FFB4AB',
      '90': '#FFDAD6',
      '95': '#FFEDEA',
      '98': '#FFF8F7',
      '99': '#FFFBFF',
      '100': '#FFFFFF',
    },
    'neutral': {
      '0': '#000000',
      '5': '#0E1112',
      '10': '#191C1D',
      '15': '#242622',
      '20': '#2E3132',
      '25': '#393C3D',
      '30': '#444748',
      '35': '#505354',
      '40': '#5C5F60',
      '50': '#747778',
      '60': '#8E9192',
      '70': '#A9ACAC',
      '80': '#C4C7C8',
      '90': '#E1E3E3',
      '95': '#EFF1F2',
      '98': '#F8FAFA',
      '99': '#FBFCFD',
      '100': '#FFFFFF',
    },
    'neutralVariant': {
      '0': '#000000',
      '5': '#0A1214',
      '10': '#141D1F',
      '15': '#22271F',
      '20': '#293234',
      '25': '#343D3F',
      '30': '#3F484B',
      '35': '#4B5456',
      '40': '#576062',
      '50': '#6F797B',
      '60': '#899295',
      '70': '#A3ADAF',
      '80': '#BFC8CB',
      '90': '#DBE4E7',
      '95': '#E9F2F5',
      '98': '#F2FBFD',
      '99': '#F7FDFF',
      '100': '#FFFFFF',
    },
  },
  'styles': {
    'display': {
      'large': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 57,
        'lineHeight': 64,
        'letterSpacing': -0.25,
      },
      'medium': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 45,
        'lineHeight': 52,
        'letterSpacing': 0,
      },
      'small': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 36,
        'lineHeight': 44,
        'letterSpacing': 0,
      },
    },
    'headline': {
      'large': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 32,
        'lineHeight': 40,
        'letterSpacing': 0,
      },
      'medium': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 28,
        'lineHeight': 36,
        'letterSpacing': 0,
      },
      'small': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 24,
        'lineHeight': 32,
        'letterSpacing': 0,
      },
    },
    'body': {
      'large': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 16,
        'lineHeight': 24,
        'letterSpacing': 0.5,
      },
      'medium': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 14,
        'lineHeight': 20,
        'letterSpacing': 0.25,
      },
      'small': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 12,
        'lineHeight': 16,
        'letterSpacing': 0.4000000059604645,
      },
    },
    'label': {
      'large': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Medium',
        'fontWeight': 500,
        'fontSize': 14,
        'lineHeight': 20,
        'letterSpacing': 0.10000000149011612,
      },
      'medium': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Medium',
        'fontWeight': 500,
        'fontSize': 12,
        'lineHeight': 16,
        'letterSpacing': 0.5,
      },
      'small': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Medium',
        'fontWeight': 500,
        'fontSize': 11,
        'lineHeight': 16,
        'letterSpacing': 0.5,
      },
    },
    'title': {
      'large': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Regular',
        'fontWeight': 400,
        'fontSize': 22,
        'lineHeight': 28,
        'letterSpacing': 0,
      },
      'medium': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Medium',
        'fontWeight': 500,
        'fontSize': 16,
        'lineHeight': 24,
        'letterSpacing': 0.15000000596046448,
      },
      'small': {
        'fontFamilyName': 'Roboto',
        'fontFamilyStyle': 'Medium',
        'fontWeight': 500,
        'fontSize': 14,
        'lineHeight': 20,
        'letterSpacing': 0.10000000149011612,
      },
    },
  },
  'extendedColors': [],
  'name': 'material-theme',
}

const colors = {
  primary100: Theme.palettes.primary["100"],
  primary99: Theme.palettes.primary["99"],
  primary95: Theme.palettes.primary["95"],
  primary90: Theme.palettes.primary["90"],
  primary80: Theme.palettes.primary["80"],
  primary70: Theme.palettes.primary["70"],
  primary60: Theme.palettes.primary["60"],
  primary50: Theme.palettes.primary["50"],
  primary40: Theme.palettes.primary["40"],
  primary30: Theme.palettes.primary["30"],
  primary20: Theme.palettes.primary["20"],
  primary10: Theme.palettes.primary["10"],
  primary0: Theme.palettes.primary["10"],

  secondary100: Theme.palettes.secondary["100"],
  secondary99: Theme.palettes.secondary["99"],
  secondary95: Theme.palettes.secondary["95"],
  secondary90: Theme.palettes.secondary["90"],
  secondary80: Theme.palettes.secondary["80"],
  secondary70: Theme.palettes.secondary["70"],
  secondary60: Theme.palettes.secondary["60"],
  secondary50: Theme.palettes.secondary["50"],
  secondary40: Theme.palettes.secondary["40"],
  secondary30: Theme.palettes.secondary["30"],
  secondary20: Theme.palettes.secondary["20"],
  secondary10: Theme.palettes.secondary["10"],
  secondary0: Theme.palettes.secondary["10"],

  tertiary100: Theme.palettes.tertiary["100"],
  tertiary99: Theme.palettes.tertiary["99"],
  tertiary95: Theme.palettes.tertiary["95"],
  tertiary90: Theme.palettes.tertiary["90"],
  tertiary80: Theme.palettes.tertiary["80"],
  tertiary70: Theme.palettes.tertiary["70"],
  tertiary60: Theme.palettes.tertiary["60"],
  tertiary50: Theme.palettes.tertiary["50"],
  tertiary40: Theme.palettes.tertiary["40"],
  tertiary30: Theme.palettes.tertiary["30"],
  tertiary20: Theme.palettes.tertiary["20"],
  tertiary10: Theme.palettes.tertiary["10"],
  tertiary0: Theme.palettes.tertiary["10"],

  error100: Theme.palettes.error["100"],
  error99: Theme.palettes.error["99"],
  error95: Theme.palettes.error["95"],
  error90: Theme.palettes.error["90"],
  error80: Theme.palettes.error["80"],
  error70: Theme.palettes.error["70"],
  error60: Theme.palettes.error["60"],
  error50: Theme.palettes.error["50"],
  error40: Theme.palettes.error["40"],
  error30: Theme.palettes.error["30"],
  error20: Theme.palettes.error["20"],
  error10: Theme.palettes.error["10"],
  error0: Theme.palettes.error["10"],

  neutral100: Theme.palettes.neutral["100"],
  neutral99: Theme.palettes.neutral["99"],
  neutral95: Theme.palettes.neutral["95"],
  neutral90: Theme.palettes.neutral["90"],
  neutral80: Theme.palettes.neutral["80"],
  neutral70: Theme.palettes.neutral["70"],
  neutral60: Theme.palettes.neutral["60"],
  neutral50: Theme.palettes.neutral["50"],
  neutral40: Theme.palettes.neutral["40"],
  neutral30: Theme.palettes.neutral["30"],
  neutral20: Theme.palettes.neutral["20"],
  neutral10: Theme.palettes.neutral["10"],
  neutral0: Theme.palettes.neutral["10"],

  neutralVariant100: Theme.palettes.neutralVariant["100"],
  neutralVariant99: Theme.palettes.neutralVariant["99"],
  neutralVariant95: Theme.palettes.neutralVariant["95"],
  neutralVariant90: Theme.palettes.neutralVariant["90"],
  neutralVariant80: Theme.palettes.neutralVariant["80"],
  neutralVariant70: Theme.palettes.neutralVariant["70"],
  neutralVariant60: Theme.palettes.neutralVariant["60"],
  neutralVariant50: Theme.palettes.neutralVariant["50"],
  neutralVariant40: Theme.palettes.neutralVariant["40"],
  neutralVariant30: Theme.palettes.neutralVariant["30"],
  neutralVariant20: Theme.palettes.neutralVariant["20"],
  neutralVariant10: Theme.palettes.neutralVariant["10"],
  neutralVariant0: Theme.palettes.neutralVariant["10"],

  surface1Light: "#ecf3f3",
  surface5Light: "#d5e6e8",
  surface1Dark: "#182022",
  surface5Dark: "#16272a",
}

// export const ChartColors = [
//   "#213C43",
//   "#90A5A2",
//   "#6F272D",
//   "#C73426",
//   "#D97465",
//   "#A25831",
//   "#F9B46E",
// ]
export const ChartColorsLight = [
  "#093E48",
  "#6B9A91",
  "#A9C4AB",
  "#E4DDA3",
  "#D8C27B",
  "#EA8520",
  "#DC6921",
  "#9F3202",
  "#5D2109",
]
export const ChartColorsDark = [
  "#2093a8",
  "#6B9A91",
  "#A9C4AB",
  "#E4DDA3",
  "#D8C27B",
  "#EA8520",
  "#DC6921",
  "#c83e07",
  "#9f3202",
]

export type CustomColors = typeof colors;
export type CustomThemes = {
  primary: "string"
  onPrimary: "string"
  primaryContainer: "string"
  onPrimaryContainer: "string"
  secondary: "string"
  onSecondary: "string"
  secondaryContainer: "string"
  onSecondaryContainer: "string"
  tertiary: "string"
  onTertiary: "string"
  tertiaryContainer: "string"
  onTertiaryContainer: "string"
  error: "string"
  onError: "string"
  errorContainer: "string"
  onErrorContainer: "string"
  background: "string"
  onBackground: "string"
  surface: "string"
  surfaceHighest: "string"
  onSurface: "string"
  outline: "string"
  overlay: "string",
};

Colors.loadColors(colors)
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
      surfaceHighest: Colors.surface5Light,
      onSurface: Colors.neutral10,

      outline: Colors.neutralVariant50,
      overlay: Colors.neutralVariant10  + "66",
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
      surfaceHighest: Colors.surface5Dark,
      onSurface: Colors.neutral90,

      outline: Colors.neutralVariant60,
      overlay: Colors.neutralVariant10 + "66",
    },
  }
)

export type ThemeColors = typeof Colors & CustomColors & CustomThemes;

const TypographyFromToken = (key: keyof typeof Theme.styles, variant: keyof typeof Theme.styles[keyof typeof Theme.styles]) => {
    const style = Theme.styles[key][variant]
    return {
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
        fontWeight: `${style.fontWeight}`,
        fontFamily: style.fontFamilyName,
        letterSpacing: style.letterSpacing,
    } as TextStyle
}

export const Typography = {
  TitleLarge: TypographyFromToken("title", "large"),
  TitleMedium: TypographyFromToken("title", "medium"),
  TitleSmall: TypographyFromToken("title", "small"),
  LabelLarge: TypographyFromToken("label", "large"),
  LabelMedium: TypographyFromToken("label", "medium"),
  LabelSmall: TypographyFromToken("label", "small"),
  BodyLarge: TypographyFromToken("body", "large"),
  BodyMedium: TypographyFromToken("body", "medium"),
  BodySmall: TypographyFromToken("body", "small"),
}