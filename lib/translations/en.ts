export const en = {
  pages: {
    home: 'Meter Tracker',
  },
  buildings: {
    defaultName: 'Home',
    modalTitle: 'Select a Building',
    createButton: 'Create building',
    defaultMarked: 'Default',
    markAsDefault: 'Mark as default',
  },
  meters: {
    sectionTitle: 'Meter',
    createButton: 'Create meter',
    emptyList: "You don't have any meters yet.",
  },
  contracts: {
    sectionTitle: 'Contracts',
    createButton: 'Create contract',
    emptyList: "You don't have any contracts yet.",
  },
  meterTypes: {
    consumption: {
      name: 'Consumption',
      description: 'Meter for measuring consumption of a resource (e.g. electricity, water, gas)',
    },
    'consumption:tank': {
      name: 'Consumption (tank)',
      description:
        'Meter for measuring consumption of a resource that can be refilled (e.g. heating oil)',
    },
    generation: {
      name: 'Generation',
      description: 'Meter for measuring generation of a resource (e.g. solar panels)',
    },
  },
  units: {
    kwh: 'Kilowatt-hour',
    mwh: 'Megawatt-hour',
    gwh: 'Gigawatt-hour',
    w: 'Watt',
    l: 'Liter',
    m3: 'Cubic meter (water)',
    'm3-gas-natural': 'Cubic meter (natural gas)',
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
