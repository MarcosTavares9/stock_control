// API calls and adapters for location feature

import { Localizacao, CreateLocalizacaoRequest, UpdateLocalizacaoRequest } from '../domain'

/**
 * Lista todas as localizações
 * @returns Promise com lista de localizações
 */
export async function listLocalizacoes(): Promise<Localizacao[]> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch('/api/locations', {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   }
  // })
  // if (!response.ok) {
  //   throw new Error('Erro ao listar localizações')
  // }
  // return await response.json()
  
  // Buscar localizações salvas no localStorage
  const savedLocalizacoes = localStorage.getItem('localizacoes_list')
  if (savedLocalizacoes) {
    return JSON.parse(savedLocalizacoes)
  }
  
  // Retornar lista padrão
  return [
    {
      id: '1',
      nome: 'Estoque Principal',
      descricao: 'Armazém principal da empresa',
      ativo: true
    },
    {
      id: '2',
      nome: 'Setor A',
      descricao: 'Setor A do armazém',
      ativo: true
    },
    {
      id: '3',
      nome: 'Setor B',
      descricao: 'Setor B do armazém',
      ativo: true
    },
    {
      id: '4',
      nome: 'Escritório',
      descricao: 'Localização no escritório',
      ativo: true
    }
  ]
}

/**
 * Cria uma nova localização
 * @param data Dados da nova localização
 * @returns Promise com a localização criada
 */
export async function createLocalizacao(data: CreateLocalizacaoRequest): Promise<Localizacao> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch('/api/locations', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao criar localização')
  // }
  // return await response.json()
  
  // Criar nova localização
  const newLocalizacao: Localizacao = {
    id: Date.now().toString(),
    nome: data.nome,
    descricao: data.descricao || '',
    ativo: true
  }
  
  // Buscar lista atual e adicionar nova localização
  const localizacoes = await listLocalizacoes()
  localizacoes.push(newLocalizacao)
  localStorage.setItem('localizacoes_list', JSON.stringify(localizacoes))
  
  return newLocalizacao
}

/**
 * Atualiza uma localização
 * @param id ID da localização
 * @param data Dados para atualização
 * @returns Promise com a localização atualizada
 */
export async function updateLocalizacao(id: string, data: UpdateLocalizacaoRequest): Promise<Localizacao> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/locations/${id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao atualizar localização')
  // }
  // return await response.json()
  
  // Buscar lista atual e atualizar localização
  const localizacoes = await listLocalizacoes()
  const index = localizacoes.findIndex(l => l.id === id)
  
  if (index === -1) {
    throw new Error('Localização não encontrada')
  }
  
  localizacoes[index] = {
    ...localizacoes[index],
    ...data
  }
  
  localStorage.setItem('localizacoes_list', JSON.stringify(localizacoes))
  
  return localizacoes[index]
}

/**
 * Deleta uma localização
 * @param id ID da localização
 * @returns Promise que resolve quando a localização é deletada
 */
export async function deleteLocalizacao(id: string): Promise<void> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Em produção, aqui seria a chamada real à API
  // const token = localStorage.getItem('auth_token')
  // const response = await fetch(`/api/locations/${id}`, {
  //   method: 'DELETE',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   }
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao deletar localização')
  // }
  
  // Buscar lista atual e remover localização
  const localizacoes = await listLocalizacoes()
  const filtered = localizacoes.filter(l => l.id !== id)
  localStorage.setItem('localizacoes_list', JSON.stringify(filtered))
}





