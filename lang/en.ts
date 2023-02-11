const lang = {
  common: {
    app_name: 'Test english',
  },
  home_screen: {
    title: "Dashboard",

    meters_section_title: "Meters",
    contracts_section_title: "Contracts",

    add_new_meter: "Add Meter",
    add_new_contract: "Add Contract",
  },
  meter: {
    no_previous_reading: "No previous reading",
    last_reading: "Last from {{date}}",
    reading_value: "{{value}} {{unit}}",
  },
  contract: {
  },
  utils: {
  }
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
