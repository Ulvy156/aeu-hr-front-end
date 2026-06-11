export interface SelectOption<T = string | number | boolean | null> {
  label: string
  value: T
  disabled?: boolean
}
