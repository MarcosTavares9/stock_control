// API calls and adapters for settings feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { UserProfile, UpdateProfileRequest, Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from './settings.types'

interface UserApiResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  profilePicture: string | null
  status: 'active' | 'inactive'
  emailConfirmed: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Converte resposta da API para formato do domínio (UserProfile)
 */
function mapUserToProfile(data: UserApiResponse): UserProfile {
  const nameParts = data.firstName.split(' ')
  const nome = nameParts[0] || ''
  const sobrenome = nameParts.slice(1).join(' ') || data.lastName || ''
  
  return {
    id: data.id,
    nome,
    sobrenome,
    email: data.email,
    telefone: data.phone || undefined,
    fotoPerfil: data.profilePicture || undefined
  }
}

/**
 * Busca o perfil completo do usuário
 * @param userId ID do usuário
 * @returns Promise com os dados do perfil
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await api.get<UserApiResponse>(endpoints.users.getById(userId))
  return mapUserToProfile(response.data)
}

/**
 * Atualiza o perfil do usuário
 * @param userId ID do usuário
 * @param data Dados para atualização
 * @returns Promise com os dados atualizados do perfil
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileRequest
): Promise<UserProfile> {
  const apiData: any = {
    firstName: data.nome,
    lastName: data.sobrenome || '',
    email: data.email
  }
  
  if (data.telefone) apiData.phone = data.telefone
  if (data.fotoPerfil !== undefined) apiData.profilePicture = data.fotoPerfil
  
  const response = await api.put<UserApiResponse>(endpoints.users.update(userId), apiData)
  return mapUserToProfile(response.data)
}

/**
 * Atualiza a foto de perfil do usuário
 * @param userId ID do usuário
 * @param photoUrl URL da foto no Firebase Storage (ou null para remover)
 * @returns Promise com os dados atualizados do perfil
 */
export async function updateProfilePicture(
  userId: string,
  photoUrl: string | null
): Promise<UserProfile> {
  const response = await api.put<UserApiResponse>(endpoints.users.update(userId), {
    profilePicture: photoUrl
  })
  return mapUserToProfile(response.data)
}

/**
 * Converte resposta da API para formato do domínio (Usuario)
 */
function mapUserToUsuario(data: UserApiResponse): Usuario {
  return {
    id: data.id,
    nome: `${data.firstName} ${data.lastName}`,
    email: data.email,
    cargo: 'Usuário', // A API não retorna cargo, usar padrão
    status: data.status === 'active' ? 'ativo' : 'inativo'
  }
}

/**
 * Lista todos os usuários
 * @returns Promise com lista de usuários
 */
export async function listUsuarios(): Promise<Usuario[]> {
  const response = await api.get<UserApiResponse[]>(endpoints.users.list())
  return response.data.map(mapUserToUsuario)
}

/**
 * Cria um novo usuário
 * @param data Dados do novo usuário
 * @returns Promise com o usuário criado
 */
export async function createUsuario(data: CreateUsuarioRequest): Promise<Usuario> {
  const nameParts = data.nome.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  
  const apiData = {
    firstName,
    lastName,
    email: data.email,
    password: data.senha
  }
  
  const response = await api.post<UserApiResponse>(endpoints.users.create(), apiData)
  return mapUserToUsuario(response.data)
}

/**
 * Atualiza um usuário
 * @param id ID do usuário
 * @param data Dados para atualização
 * @returns Promise com o usuário atualizado
 */
export async function updateUsuario(id: string, data: UpdateUsuarioRequest): Promise<Usuario> {
  const apiData: any = {}
  
  if (data.nome) {
    const nameParts = data.nome.split(' ')
    apiData.firstName = nameParts[0] || ''
    apiData.lastName = nameParts.slice(1).join(' ') || ''
  }
  
  if (data.email) apiData.email = data.email
  if (data.status) apiData.status = data.status === 'ativo' ? 'active' : 'inactive'
  if (data.senha) apiData.password = data.senha
  
  const response = await api.put<UserApiResponse>(endpoints.users.update(id), apiData)
  return mapUserToUsuario(response.data)
}

/**
 * Busca um usuário por ID
 * @param id ID do usuário
 * @returns Promise com o usuário encontrado
 */
export async function getUsuarioById(id: string): Promise<Usuario> {
  const response = await api.get<UserApiResponse>(endpoints.users.getById(id))
  return mapUserToUsuario(response.data)
}

/**
 * Deleta um usuário
 * @param id ID do usuário
 * @returns Promise que resolve quando o usuário é deletado
 */
export async function deleteUsuario(id: string): Promise<void> {
  await api.delete(endpoints.users.delete(id))
}
