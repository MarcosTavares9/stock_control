// Domain entities, use cases and business rules for settings feature

export interface UserProfile {
  id: string
  nome: string
  sobrenome?: string
  email: string
  telefone?: string
  cpf?: string
  cnpj?: string
  cargo?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  fotoPerfil?: string
}

export interface UpdateProfileRequest {
  nome: string
  sobrenome?: string
  email: string
  telefone?: string
  cpf?: string
  cnpj?: string
  cargo?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  cargo: string
  status: 'ativo' | 'inativo'
}

export interface CreateUsuarioRequest {
  nome: string
  email: string
  cargo: string
  senha: string
}

export interface UpdateUsuarioRequest {
  nome?: string
  email?: string
  cargo?: string
  status?: 'ativo' | 'inativo'
  senha?: string
}
