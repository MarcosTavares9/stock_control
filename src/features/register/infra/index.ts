// API calls and adapters for register feature

import { RegisterRequest } from '../domain'

/**
 * Registra um novo usuário
 * @param data Dados do registro
 * @returns Promise que resolve quando o registro é concluído
 */
export async function registerUser(data: RegisterRequest): Promise<void> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Em produção, aqui seria a chamada real à API
  // const response = await fetch('/api/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // })
  // if (!response.ok) {
  //   throw new Error('Erro ao criar conta')
  // }
  
  console.log('Dados do cadastro:', data)
}

/**
 * Confirma o registro do usuário usando o token
 * @param token Token de confirmação
 * @param signal Signal para cancelar a requisição
 * @returns Promise que resolve quando a confirmação é concluída
 */
export async function confirmRegistration(token: string, signal?: AbortSignal): Promise<void> {
  // Simulação de chamada à API
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Verificar se a requisição foi cancelada
  if (signal?.aborted) {
    throw new DOMException('AbortError', 'AbortError')
  }
  
  // Em produção, aqui seria a chamada real à API
  // const response = await fetch(`/api/confirm-registration/${token}`, {
  //   method: 'POST',
  //   signal
  // })
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Erro ao confirmar registro')
  // }
  
  console.log('Confirmação de registro:', token)
}

