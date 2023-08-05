const lang = {
  common: {
    app_name: 'Test english',
  },
  home_screen: {
    title: 'Dashboard',

    meters_section_title: 'Meters',
    contracts_section_title: 'Contracts',

    add_new_meter: 'Add Meter',
    add_new_reading: 'Add Reading',
    add_new_contract: 'Add Contract',
  },
  meter: {
    meter: 'Meter',

    no_previous_reading: 'No previous reading',
    last_reading: 'Last from {{date}}',
    last_reading_value: 'Last reading was: {{value}} {{unit}}',
    reading_value: '{{value}} {{unit}}',

    input_placeholder_name: "Name*",
    input_placeholder_identification: "Identification Number (optional)",
    input_placeholder_digit: "Digits*",
    input_placeholder_unit: "Unit*",
    input_placeholder_is_increase: "Values decrease over time",
    input_placeholder_is_valid: "Is active",

    reading: "Reading",
    configuration: "Configuration",

    usage_per_day: "Usage per day",
  },
  contract: {
    input_placeholder_price_per_unit: "Price per unit*",
    last_month: "Last month:",
    this_month: "This month:",
    in_cents: "in cents",

    contract: "Contract"
  },
  utils: {
    date: "Date",
    history: "History",

    deleted_reading: "Deleted reading",

    camera_permission: "Camera Permissions",
    camera_permission_message: "We require camera permissions to use the torch on the back of your phone.",

    per_day: 'per day',
    add_entry: "Add entry",
    reminder_interval: "Reminder Interval",

    day_of_week: "Day of week",
    day_of_month: "Day of month",
    month: "Month",

    hour: "Hour",
    minute: "Minute",

    cancel: "Cancel",
    save: "Save",
    undo: "Undo",

    interval_daily: "Daily",
    interval_weekly: "Weekly",
    interval_monthly: "Monthly",
    interval_yearly: "Yearly",

    settings: "Settings",

    data: "Data",
    export_data: "Export data",
    export_data_description: "Export your data as a CSV",
    import_data: "Import data",
    import_data_description: "Import your data from a CSV",

    reminder: "Reminder",
    enable_reminder: "Enable reminder",
    enable_reminder_description: "A regular reminder to enter readings",

    danger_zone: "Danger Zone",
    enable_danger_zone: "Enable danger zone",
    enable_danger_zone_description: "Only activate this if you know what you are doing.",
    delete_all_data: "Delete all data",

    importing_data: "Importing data",
    import_finished: "Import finished",

    deleting_data: "Deleting data",
    delete_finished: "Delete finished",

    notification_permission_dialog_title: "Notification Permissions",
    notification_permission_dialog_message: "We need permission to send you reminders. You can change this in the settings.",
    notification_permission_dialog_cancel: "Cancel",
    notification_permission_dialog_goto_settings: "Go to Settings",
  },
  validationMessage: {
    required: 'This field is required',
    isNotANumber: 'This field must be a number',
    monthNotInRange: 'This field must be between 1 and 12',
    dayOfMonthNotInRange: 'This field must be between 1 and 31',
  },
}

type PathOf<T> = {
  // @ts-ignore
  [K in keyof T]: T[K] extends object ? `${ K }:${ PathOf<T[K]> }` : K
}[keyof T]

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type Language = RecursivePartial<typeof lang>
export type LangKey = PathOf<typeof lang>

export default lang