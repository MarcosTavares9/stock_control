// Domain entities, use cases and business rules for settings feature

export interface UserProfile {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
}

export interface UpdateProfileRequest {
  nome: string
  email: string
  telefone?: string
  cargo?: string
}
