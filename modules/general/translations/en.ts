export const en = {
  pages: {
    home: 'Meter Tracker',
    settings: 'Settings',
  },
  general: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    select: 'Select',
    apply: 'Apply',
    clear: 'Clear',
    reset: 'Reset',
    day: 'Day',
    activate: 'Activate',
    typeHere: 'Type here...',
    perDay: '/day',
  },
  buildings: {
    defaultName: 'Home',
    modalTitle: 'Select a Building',
    createButton: 'Create building',
    defaultMarked: 'Default',
    markAsDefault: 'Mark as default',
  },
  readings: {
    createModalTitle: 'Create reading',
    updateModalTitle: 'Edit reading',
    createLabelValue: 'Value *',
    createLabelTimestamp: 'Timestamp *',
    createLabelMeter: 'Meter *',
    createSectionActions: 'Actions',
    actionDelete: 'Delete reading',
    actionDeleteDescription:
      'This entry will be deleted, this action cannot be undone',
    alertDeleteTitle: 'Are you sure?',
    alertDeleteDescription:
      'This entry will be deleted permanently and this action cannot be undone.',
    lastReadingHint: 'Last reading was %{value} on %{timestamp}',
    noLastReadingHint: 'No last reading available',
  },
  meters: {
    selectTitle: 'Select a meter',
    createModalTitle: 'Create meter',
    updateModalTitle: 'Edit meter',
    createLabelName: 'Name *',
    createLabelIdentifier: 'Identifier',
    createLabelPrecision: 'Precision *',
    createLabelPrecisionHint: 'Number of decimal places',
    createLabelUnit: 'Unit *',
    createLabelMeterType: 'Meter Type *',
    createLabelMeterTypeHint:
      'Determines how usages are interpreted and displayed',
    createLabelContract: 'Contract',
    createLabelCustomUnitConversion: 'Custom unit conversion',
    createLabelCustomUnitConversionHint:
      'If left empty, the default unit conversion will be used',
    createSectionContracts: 'Contracts',
    createSectionConversion: 'Conversion',
    createSectionConversionHint:
      'Given the unit of the contract and this meters unit, this is how the price would be calculated',
    createSectionActions: 'Actions',
    actionReset: 'Reset meter to zero',
    actionResetDescription: 'Keeps last value and adds it to all new readings',
    actionInactive: 'Mark meter as inactive',
    actionInactiveDescription:
      'Meter will not be shown on the dashboard anymore',
    actionDelete: 'Delete meter',
    actionDeleteDescription:
      'All data will be deleted, this action cannot be undone',
    alertDeleteTitle: 'Are you sure?',
    alertDeleteDescription:
      'All data will be deleted permanently and this action cannot be undone.',
    sectionTitle: 'Meter',
    createButton: 'Create meter',
    emptyList: "You don't have any meters yet.",
    graphs: {
      noData: 'No data available',
      perDayTitle: 'Usage per day',
      perYearTitle: 'Usage per year',
      filter: 'Filter',
      from: 'From',
      until: 'Until',
      yearSelectionTitle: 'Only selected years',
      yearSelectionTitleHint: 'Overwrites the date range selection',
    },
  },
  contracts: {
    createModalTitle: 'Create contract',
    updateModalTitle: 'Edit contract',
    createLabelName: 'Name *',
    createLabelIdentifier: 'Identifier',
    createLabelUnit: 'Unit *',
    createLabelPricePerUnit: 'Price per unit *',
    createLabelBasePayment: 'Base payment',
    createLabelBasePaymentHint: 'A fixed amount you have to pay per year',
    createLabelMonthlyPayment: 'Monthly payment',
    createLabelMonthlyPaymentHint:
      'How much you have to pay to the provider each month',
    createLabelStartDate: 'Start date *',
    createLabelEndDate: 'End date',
    createSectionRevision: 'Revision',
    createSectionActions: 'Actions',
    actionNewRevision: 'Create new revision',
    actionNewRevisionDescription:
      'If the conditions of the contract have changed, create a new revision',
    actionDelete: 'Delete contract',
    actionDeleteDescription:
      'All data will be deleted, this action cannot be undone',
    alertDeleteTitle: 'Are you sure?',
    alertDeleteDescription:
      'All data will be deleted permanently and this action cannot be undone.',
    newRevisionHeader: 'New',
    selectTitle: 'Select a contract',
    selectValueEmpty: 'No contract',
    sectionTitle: 'Contracts',
    createButton: 'Create contract',
    emptyList: "You don't have any contracts yet.",
    startMustBeAfterPreviousRevisions:
      "Start date must be after previous revisions' end date",
    warningEditingExistingRevision:
      'Warning: Editing an existing revision should only be done to correct errors. To reflect updates, please consider adding a new revision instead.',
  },
  meterTypes: {
    selectTitle: 'Select a meter type',
    consumption: {
      name: 'Consumption',
      description:
        'Meter for measuring consumption of a resource (e.g. electricity, water, gas)',
    },
    'consumption:tank': {
      name: 'Consumption (tank)',
      description:
        'Meter for measuring consumption of a resource that can be refilled (e.g. heating oil)',
    },
    generation: {
      name: 'Generation',
      description:
        'Meter for measuring generation of a resource (e.g. solar panels)',
    },
  },
  units: {
    selectTitle: 'Select a unit',
    kwh: 'Kilowatt-hour',
    mwh: 'Megawatt-hour',
    gwh: 'Gigawatt-hour',
    w: 'Watt',
    l: 'Liter',
    m3: 'Cubic meter (water)',
    'm3-gas-natural': 'Cubic meter (natural gas)',
    percent: 'Percent',
  },
  errors: {
    endAfterStart: 'End date must be after start date',
    required: 'This field is required',
    min1: 'Minimum length is 1 character',
    number: 'Must be a number',
    integer: 'Must be an integer',
    positive: 'Must be a positive number',
    date: 'Must be a valid date',
    lessThan31: 'Must be less than or equal to 31',
    timeHour: 'Must be between 0 and 23',
    timeMinute: 'Must be between 0 and 59',
  },
  settings: {
    headerGeneral: 'General',
    currencyOptionTitle: 'Currency',
    currencyOptionDescription: 'Selected: {{currency}}',
    currencySelectTitle: 'Select a currency',
    currencySelectValues: {
      undefined: "System's default",
      defaultDescription: 'Currency defined by the system language',
      EUR: 'Euro',
      USD: 'US Dollar',
      GBP: 'British Pound',
    },
    languageOptionTitle: 'Language',
    languageOptionDescription: 'Selected language: {{language}}',
    languageSelectTitle: 'Select a language',
    languageSelectValues: {
      undefined: "System's default",
      defaultDescription: 'Language defined by the system',
      en: 'English',
      de: 'German',
    },
    languageChangeWarning: 'Changing the language will reload the app',
    languageChangeReloadReason: 'Language changed',
    themeOptionTitle: 'Theme',
    themeOptionDescription: 'Selected theme: {{theme}}',
    themeSelectTitle: 'Select a theme',
    themeSelectValues: {
      undefined: "System's default",
      defaultDescription: 'Theme defined by the system',
      light: 'Light',
      dark: 'Dark',
    },
    headerData: 'Data',
    exportOptionTitle: 'Export data',
    exportOptionDescription: 'Export all data as a file',
    importOptionTitle: 'Import data',
    importOptionDescription: 'Import data from a selected CSV file',
    headerReminder: 'Reminder',
    reminderStatusOptionTitle: 'Status',
    reminderStatusOptionDescriptionGranted:
      'Permission granted | Next reminder: {{nextReminder}}',
    reminderStatusOptionDescriptionDenied:
      'Permission denied | To enable reminders, please allow notifications in your settings',
    reminderStatusOptionDescriptionUndetermined:
      'Permission undetermined | Enable reminders and grant the permission',
    enableReminderTitle: 'Enable reminder',
    enableReminderDescription: 'A regular reminder to write down new readings',
    reminderIntervalTitle: 'Reminder Interval',
    headerDangerZone: 'Danger Zone',
    activateDangerZoneTitle: 'Activate Danger Zone',
    activateDangerZoneTitleDisable: 'Deactivate Danger Zone',
    activateDangerZoneDescription:
      'Only activate if you know what you are doing',
    dangerZoneAlertTitle: 'Activate Danger Zone',
    dangerZoneAlertDescription: 'Only activate if you know what you are doing',
    resetOptionTitle: 'Reset all data',
    resetOptionDescription:
      'This will delete all data permanently and cannot be undone',
    permissionDialogTitle: 'Notification Permissions',
    permissionDialogDescription:
      'We need permission to send you reminders. You can change this in the settings.',
    goToSettings: 'Go to Settings',
  },
  intervals: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  },
  reminder: {
    channel: 'Reminder',
    title: 'Reading reminder',
    body: 'It is time to enter your readings',
  },
}

type PathOf<T> = {
  // @ts-ignore
  [K in keyof T]: T[K] extends object ? `${K}.${PathOf<T[K]>}` : K
}[keyof T]

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type Language = RecursivePartial<typeof en>
export type LangKey = PathOf<typeof en>
