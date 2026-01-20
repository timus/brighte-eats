export type Services = "DELIVERY" | "PICK_UP" | "PAYMENT"

export type RegisterInput = {
  name: string
  email: string
  mobile: string
  postcode: string
  services: Services[]
}

export type PaginationInput = {
  page: number
}

export type LeadFilter = { email?: string; postcode?: string }

export type Customer = {
  name: string
  email: string
  mobile: string
  postcode: string
}

export type LeadService = {
  service: Services
}

export type Lead = {
  id: number
  customer: Customer
  services: LeadService[]
  createdAt: Date
}
