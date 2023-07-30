import { Language } from './en'

const lang: Language = {
  common: {
    app_name: 'Test deutsch',
  },
  home_screen: {
    title: 'Übersicht',

    meters_section_title: 'Messgeräte',
    contracts_section_title: 'Verträge',

    add_new_meter: 'Messgerät hinzufügen',
    add_new_reading: 'Zählerstand hinzufügen',
    add_new_contract: 'Vertrag hinzufügen',
  },
  meter: {
    meter: "Messgerät",

    no_previous_reading: 'Kein vorheriger Zählerstand',
    last_reading: 'Zuletzt vom {{date}}',
    last_reading_value: 'Letzte Messung war: {{value}} {{unit}}',

    input_placeholder_name: "Name*",
    input_placeholder_identification: "Identifikationsnummer (optional)",
    input_placeholder_digit: "Präzision*",
    input_placeholder_unit: "Einheit*",
    input_placeholder_is_increase: "Werte sinken über Zeit",
    input_placeholder_is_valid: "Ist aktiv",

    reading: "Zählerstand",
    configuration: "Konfiguration",

    usage_per_day: "Verbrauch pro Tag",
  },
  contract: {
    input_placeholder_price_per_unit: "Preis pro Einheit*",
    last_month: "Letzten Monat:",
    this_month: "Diesen Monat:",
    in_cents: "in Cent",

    contract: "Vertrag"
  },
  utils: {
    date: "Datum",
    history: "Jahr",

    deleted_reading: "Zählerstand gelöscht",

    camera_permission: "Kameraberechtigung",
    camera_permission_message: "Wir benötigen die Kameraberechtigung, um die Taschenlampe auf der Rückseite Ihres Telefons zu verwenden.",

    per_day: 'pro Tag',
    add_entry: "Eintrag hinzufügen",
    reminder_interval: "Erinnerungsintervall",

    day_of_week: "Wochentag",
    day_of_month: "Tag des Monats",
    month: "Monat",

    hour: "Stunde",
    minute: "Minute",

    cancel: "Abbrechen",
    save: "Speichern",
    undo: "Rückgängig",

    interval_daily: "Täglich",
    interval_weekly: "Wöchentlich",
    interval_monthly: "Monatlich",
    interval_yearly: "Jährlich",

    settings: "Einstellungen",

    data: "Daten",
    export_data: "Daten exportieren",
    export_data_description: "Exportieren Sie Ihre Daten als CSV",
    import_data: "Daten importieren",
    import_data_description: "Importieren Sie Ihre Daten von einer CSV",

    reminder: "Erinnerung",
    enable_reminder: "Erinnerung aktivieren",
    enable_reminder_description: "Regelmäßige Erinnerung an die Eingabe der Zählerstande",

    danger_zone: "Gefahrenzone",
    enable_danger_zone: "Gefahrenzone aktivieren",
    enable_danger_zone_description: "Nur aktivieren, wenn Sie wissen, was Sie tun.",
    delete_all_data: "Alle Daten löschen",

    importing_data: "Importiere Daten",
    import_finished: "Import abgeschlossen",

    deleting_data: "Lösche Daten",
    delete_finished: "Löschen abgeschlossen",

    notification_permission_dialog_title: "Benachrichtigungsberechtigung",
    notification_permission_dialog_message: "Wir benötigen die Benachrichtigungsberechtigung, um Sie an die Eingabe Ihrer Zählerstände zu erinnern.",
    notification_permission_dialog_cancel: "Abbrechen",
    notification_permission_dialog_goto_settings: "Gehe zu Einstellungen",
  },
  validationMessage: {
    required: 'Dieses Feld ist erforderlich',
    isNotANumber: 'Dieses Feld muss eine Zahl sein',
    monthNotInRange: 'Dieses Feld muss zwischen 1 und 12 liegen',
    dayOfMonthNotInRange: 'Dieses Feld muss zwischen 1 und 31 liegen',
  },
}

export default lang
