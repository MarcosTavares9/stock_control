export interface MenuItem {
  path: string
  label: string
  icon?: React.ReactNode | string
  children?: MenuItem[]
}

export interface MenuSection {
  title?: string
  items: MenuItem[]
}

