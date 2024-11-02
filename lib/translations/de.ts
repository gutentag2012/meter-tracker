import { type Language } from './en'

export const de: Language = {
  pages: {
    home: 'Meter Tracker',
  },
  buildings: {
    defaultName: 'Zuhause',
    modalTitle: 'Gebäude auswählen',
    createButton: 'Gebäude erstellen',
    defaultMarked: 'Standard',
    markAsDefault: 'Als Standard markieren',
  },
  meters: {
    sectionTitle: 'Messgeräte',
    createButton: 'Messgerät erstellen',
    emptyList: 'Sie haben noch keine Messgeräte.',
  },
  contracts: {
    sectionTitle: 'Verträge',
    createButton: 'Vertrag erstellen',
    emptyList: 'Sie haben noch keine Verträge.',
  },
  meterTypes: {
    consumption: {
      name: 'Verbrauch',
      description:
        'Messgerät zur Messung des Verbrauchs einer Ressource (z. B. Strom, Wasser, Gas)',
    },
    'consumption:tank': {
      name: 'Verbrauch (Tank)',
      description:
        'Messgerät zur Messung des Verbrauchs einer Ressource, die nachgefüllt werden kann (z. B. Heizöl)',
    },
    generation: {
      name: 'Erzeugung',
      description: 'Messgerät zur Messung der Erzeugung einer Ressource (z. B. Solaranlagen)',
    },
  },
  units: {
    kwh: 'Kilowattstunde',
    mwh: 'Megawattstunde',
    gwh: 'Gigawattstunde',
    w: 'Watt',
    l: 'Liter',
    m3: 'Kubikmeter (Wasser)',
    'm3-gas-natural': 'Kubikmeter (Erdgas)',
  },
}
