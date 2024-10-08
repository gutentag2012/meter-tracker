import { type Language } from './en'

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
    meter: 'Messgerät',

    no_previous_reading: 'Kein vorheriger Zählerstand',
    last_reading: 'Zuletzt vom {{date}}',
    last_reading_value: 'Letzte Messung war: {{value}} {{unit}}',

    input_placeholder_name: 'Name*',
    input_placeholder_identification: 'Identifikationsnummer (optional)',
    input_placeholder_digit: 'Präzision*',
    input_placeholder_unit: 'Einheit*',
    input_placeholder_is_positive: 'Höherer Verbrauch ist besser',
    input_placeholder_is_refillable: 'Zähler kann zurückgesetzt werden',
    input_placeholder_is_valid: 'Ist aktiv',

    reading: 'Zählerstand',
    configuration: 'Konfiguration',

    usage_per_day: 'Verbrauch pro Tag',
    usage_per_year: 'Verbrauch pro Jahr',
    heatmap_of_usage: 'Verbrauchshistorie',
  },
  contract: {
    input_placeholder_price_per_unit: 'Preis pro Einheit*',
    input_placeholder_conversion: 'Umrechnung*',
    last_month: 'Letzten Monat:',
    this_month: 'Diesen Monat:',
    in_cents: 'in Cent',

    contract: 'Vertrag',

    delete_contract: 'Vertrag löschen',

    explain_conversion:
      'Die Umrechnung wird verwendet, um die Einheiten des Messgeräts in die Einheiten des Vertrags umzurechnen. Wenn Ihr Messgerät beispielsweise in kWh misst und Ihr Vertrag in MWh ist, geben Sie 0,001 ein.',
  },
  buildings: {
    buildings: 'Gebäude',

    add_building: 'Gebäude hinzufügen',

    delete_building: 'Gebäude löschen',
    delete_building_warning:
      'Es ist momentan {{numberOfConnectedMeters}} Messgerät mit diesem Gebäude verknüpft. Die Verbindung wird hierdurch aufgelöst und Ihre Daten bleiben erhalten.',
    delete_building_warning_plural:
      'Es sind momentan {{numberOfConnectedMeters}} Messgeräte mit diesem Gebäude verknüpft. Die Verbindung wird hierdurch aufgelöst und Ihre Daten bleiben erhalten.',

    input_placeholder_address: 'Adresse',
    input_placeholder_notes: 'Notizen',

    default_building_name: 'Standard',

    no_address_provided: 'Keine Adresse hinterlegt',
  },
  utils: {
    date: 'Datum',
    history: 'Jahr',

    deleted_reading: 'Zählerstand gelöscht',
    deleted_building: 'Gebäude gelöscht',
    deleted_contract: 'Vertrag gelöscht',

    no_data_to_export: 'Keine Daten zum Exportieren',

    loading_data: 'Lade Daten...',
    no_data: 'Keine Daten vorhanden',

    camera_permission: 'Kameraberechtigung',
    camera_permission_message:
      'Wir benötigen die Kameraberechtigung, um die Taschenlampe auf der Rückseite Ihres Telefons zu verwenden.',

    per_day: 'pro Tag',
    add_entry: 'Eintrag hinzufügen',
    reminder_interval: 'Erinnerungsintervall',

    day_of_week: 'Wochentag',
    day_of_month: 'Tag des Monats',
    month: 'Monat',

    hour: 'Stunde',
    minute: 'Minute',

    cancel: 'Abbrechen',
    save: 'Speichern',
    undo: 'Rückgängig',

    interval_daily: 'Täglich',
    interval_weekly: 'Wöchentlich',
    interval_monthly: 'Monatlich',
    interval_yearly: 'Jährlich',

    settings: 'Einstellungen',

    data: 'Daten',
    export_data: 'Daten exportieren',
    export_data_description: 'Exportieren Sie Ihre Daten als CSV',
    import_data: 'Daten importieren',
    import_data_description: 'Importieren Sie Ihre Daten von einer CSV',

    reminder: 'Erinnerung',
    reminder_notification_body: 'Bitte geben Sie Ihre Zählerstände ein',
    enable_reminder: 'Erinnerung aktivieren',
    enable_reminder_description: 'Regelmäßige Erinnerung an die Eingabe der Zählerstande',

    features: 'Feature',
    enable_multiple_buildings: 'Mehrere Gebäude nutzen',
    enable_multiple_buildings_description:
      'Erlaubt Ihnen mehrere Gebäude zu verwalten um Messgeräte und Verträte zu gruppieren.',

    danger_zone: 'Gefahrenzone',
    enable_danger_zone: 'Gefahrenzone aktivieren',
    enable_danger_zone_description: 'Nur aktivieren, wenn Sie wissen, was Sie tun.',
    delete_all_data: 'Alle Daten löschen',

    importing_data: 'Importiere Daten',
    import_finished: 'Import abgeschlossen',

    deleting_data: 'Lösche Daten',
    delete_finished: 'Löschen abgeschlossen',

    notification_permission_dialog_title: 'Benachrichtigungsberechtigung',
    notification_permission_dialog_message:
      'Wir benötigen die Benachrichtigungsberechtigung, um Sie an die Eingabe Ihrer Zählerstände zu erinnern.',
    notification_permission_dialog_cancel: 'Abbrechen',
    notification_permission_dialog_goto_settings: 'Gehe zu Einstellungen',
  },
  validationMessage: {
    required: 'Dieses Feld ist erforderlich',
    isNotANumber: 'Dieses Feld muss eine Zahl sein',
    monthNotInRange: 'Dieses Feld muss zwischen 1 und 12 liegen',
    dayOfMonthNotInRange: 'Dieses Feld muss zwischen 1 und 31 liegen',
  },
}

export default lang
