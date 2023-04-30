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
    add_new_contract: 'Vertrag hinzufügen',
  },
  meter: {
    no_previous_reading: 'Kein vorheriger Zählerstand',
    last_reading: 'Zuletzt vom {{date}}',

    input_placeholder_name: "Name*",
    input_placeholder_identification: "Identifikationsnummer (optional)",
    input_placeholder_digit: "Präzision*",
    input_placeholder_unit: "Einheit*",
    input_placeholder_is_increase: "Werte steigen",
    input_placeholder_is_valid: "Ist aktiv",
  },
  contract: {
    input_placeholder_price_per_unit: "Preis pro Einheit*",
  },
  utils: {},
  validationMessage: {
    required: 'Dieses Feld ist erforderlich',
    isNotANumber: 'Dieses Feld muss eine Zahl sein',
  },
}

export default lang
