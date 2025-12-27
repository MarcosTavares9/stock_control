// API calls and adapters for settings feature

import { UserProfile, UpdateProfileRequest, Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../domain'

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
    sobrenome: '',
    email: userData?.email || '',
    telefone: '(11) 98765-4321',
    cpf: '',
    cnpj: '',
    cargo: 'admin',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    fotoPerfil: ''
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

/**
 * Lista todos os usuários
 * @returns Promise com lista de usuários
 */
export async function listUsuarios(): Promise<Usuario[]> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch('/api/users', {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   }
  // })
  // if (!response.ok) {
  //   throw new Error('Erro ao listar usuários')
  // }
  // return await response.json()
  
  // Buscar usuários salvos no localStorage
  const savedUsuarios = localStorage.getItem('usuarios_list')
  if (savedUsuarios) {
    return JSON.parse(savedUsuarios)
  }
  
  // Retornar lista padrão
  return [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      cargo: 'Administrador',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      cargo: 'Gerente',
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      cargo: 'Operador',
      status: 'inativo'
    }
  ]
}

/**
 * Cria um novo usuário
 * @param data Dados do novo usuário
 * @returns Promise com o usuário criado
 */
export async function createUsuario(data: CreateUsuarioRequest): Promise<Usuario> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch('/api/users', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao criar usuário')
  // }
  // return await response.json()
  
  // Criar novo usuário
  const newUsuario: Usuario = {
    id: Date.now().toString(),
    nome: data.nome,
    email: data.email,
    cargo: data.cargo,
    status: 'ativo'
  }
  
  // Buscar lista atual e adicionar novo usuário
  const usuarios = await listUsuarios()
  usuarios.push(newUsuario)
  localStorage.setItem('usuarios_list', JSON.stringify(usuarios))
  
  return newUsuario
}

/**
 * Atualiza um usuário
 * @param id ID do usuário
 * @param data Dados para atualização
 * @returns Promise com o usuário atualizado
 */
export async function updateUsuario(id: string, data: UpdateUsuarioRequest): Promise<Usuario> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/users/${id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao atualizar usuário')
  // }
  // return await response.json()
  
  // Buscar lista atual e atualizar usuário
  const usuarios = await listUsuarios()
  const index = usuarios.findIndex(u => u.id === id)
  
  if (index === -1) {
    throw new Error('Usuário não encontrado')
  }
  
  usuarios[index] = {
    ...usuarios[index],
    ...data
  }
  
  localStorage.setItem('usuarios_list', JSON.stringify(usuarios))
  
  return usuarios[index]
}

/**
 * Deleta um usuário
 * @param id ID do usuário
 * @returns Promise que resolve quando o usuário é deletado
 */
export async function deleteUsuario(id: string): Promise<void> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/users/${id}`, {
  //   method: 'DELETE',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   }
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao deletar usuário')
  // }
  
  // Buscar lista atual e remover usuário
  const usuarios = await listUsuarios()
  const filtered = usuarios.filter(u => u.id !== id)
  localStorage.setItem('usuarios_list', JSON.stringify(filtered))
}
