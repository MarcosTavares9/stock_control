// API calls and adapters for settings feature

import { UserProfile, UpdateProfileRequest } from '../domain'

/**
 * Busca o perfil completo do usuário
 * @param userId ID do usuário
 * @returns Promise com os dados do perfil
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/users/${userId}/profile`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   }
  // })
  // if (!response.ok) {
  //   throw new Error('Erro ao buscar perfil do usuário')
  // }
  // return await response.json()
  
  // Mock de dados do perfil
  // Buscar dados básicos do localStorage
  const savedUser = localStorage.getItem('auth_user')
  const userData = savedUser ? JSON.parse(savedUser) : null
  
  // Simular dados adicionais do perfil
  const mockProfile: UserProfile = {
    id: userId,
    nome: userData?.name || 'Usuário',
    email: userData?.email || '',
    telefone: '(11) 98765-4321',
    cargo: 'admin'
  }
  
  // Verificar se há dados salvos no localStorage
  const savedProfile = localStorage.getItem(`user_profile_${userId}`)
  if (savedProfile) {
    return JSON.parse(savedProfile)
  }
  
  return mockProfile
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
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/users/${userId}/profile`, {
  //   method: 'PUT',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao atualizar perfil')
  // }
  // return await response.json()
  
  // Simular atualização
  const updatedProfile: UserProfile = {
    id: userId,
    ...data
  }
  
  // Salvar no localStorage para persistência
  localStorage.setItem(`user_profile_${userId}`, JSON.stringify(updatedProfile))
  
  // Atualizar também os dados básicos do usuário no auth_user
  const savedUser = localStorage.getItem('auth_user')
  if (savedUser) {
    const userData = JSON.parse(savedUser)
    userData.name = data.nome
    userData.email = data.email
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }
  
  return updatedProfile
}
