// API calls and adapters for location feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { Localizacao, CreateLocalizacaoRequest, UpdateLocalizacaoRequest } from './location.types'

interface LocationApiResponse {
  uuid: string
  name: string
  description: string
  status: string // 'true' (ativo), 'false' (inativo), 'blocked' (excluído)
  created_at: string
  updated_at: string
}

/**
 * Converte resposta da API para formato do domínio
 */
function mapLocationFromApi(data: LocationApiResponse): Localizacao {
  return {
    id: data.uuid,
    nome: data.name,
    descricao: data.description,
    ativo: data.status === 'true' // Converter status para boolean
  }
}

/**
 * Converte dados do domínio para formato da API
 */
function mapLocationToApi(data: CreateLocalizacaoRequest | UpdateLocalizacaoRequest): any {
  const result: any = {}
  if ('nome' in data && data.nome) result.name = data.nome
  if ('descricao' in data && data.descricao !== undefined) result.description = data.descricao
  if ('ativo' in data && data.ativo !== undefined) {
    // Converter boolean para status string
    result.status = data.ativo ? 'true' : 'false'
  }
  return result
}

/**
 * Lista todas as localizações
 * @param active Filtrar apenas localizações ativas (opcional)
 * @returns Promise com lista de localizações
 */
export async function listLocalizacoes(active?: boolean): Promise<Localizacao[]> {
  const params = active !== undefined ? { active: active.toString() } : {}
  const response = await api.get<{ data: LocationApiResponse[] }>(endpoints.locations.list(), { params })
  return response.data.data.map(mapLocationFromApi)
}

/**
 * Cria uma nova localização
 * @param data Dados da nova localização
 * @returns Promise com a localização criada
 */
export async function createLocalizacao(data: CreateLocalizacaoRequest): Promise<Localizacao> {
  const apiData = {
    name: data.nome,
    description: data.descricao || ''
  }
  const response = await api.post<LocationApiResponse>(endpoints.locations.create(), apiData)
  return mapLocationFromApi(response.data)
}

/**
 * Atualiza uma localização
 * @param id ID da localização
 * @param data Dados para atualização
 * @returns Promise com a localização atualizada
 */
export async function updateLocalizacao(id: string, data: UpdateLocalizacaoRequest): Promise<Localizacao> {
  const apiData = mapLocationToApi(data)
  const response = await api.put<LocationApiResponse>(endpoints.locations.update(id), apiData)
  return mapLocationFromApi(response.data)
}

/**
 * Busca uma localização por ID
 * @param id ID da localização
 * @returns Promise com a localização encontrada
 */
export async function getLocalizacaoById(id: string): Promise<Localizacao> {
  const response = await api.get<LocationApiResponse>(endpoints.locations.getById(id))
  return mapLocationFromApi(response.data)
}

/**
 * Deleta uma localização
 * @param id ID da localização
 * @returns Promise que resolve quando a localização é deletada
 */
export async function deleteLocalizacao(id: string): Promise<void> {
  await api.delete(endpoints.locations.delete(id))
}
