// Domain entities, use cases and business rules for location feature

export interface Localizacao {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
}

export interface CreateLocalizacaoRequest {
  nome: string
  descricao?: string
}

export interface UpdateLocalizacaoRequest {
  nome?: string
  descricao?: string
  ativo?: boolean
}





