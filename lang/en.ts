const lang = {
  common: {
    app_name: 'Test english',
  },
  home_screen: {
    title: 'Dashboard',

    meters_section_title: 'Meters',
    contracts_section_title: 'Contracts',

    add_new_meter: 'Add Meter',
    add_new_contract: 'Add Contract',
  },
  meter: {
    no_previous_reading: 'No previous reading',
    last_reading: 'Last from {{date}}',
    reading_value: '{{value}} {{unit}}',

    input_placeholder_name: "Name*",
    input_placeholder_identification: "Identification Number (optional)",
    input_placeholder_digit: "Digits*",
    input_placeholder_unit: "Unit*",
    input_placeholder_is_increase: "Values are increasing",
    input_placeholder_is_valid: "Is active",
  },
  contract: {
    input_placeholder_price_per_unit: "Price per unit*",
  },
  utils: {},
  validationMessage: {
    required: 'This field is required',
    isNotANumber: 'This field must be a number',
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
