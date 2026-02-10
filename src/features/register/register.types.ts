// Domain entities, use cases and business rules for register feature

export interface RegisterFormData {
  name: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

export interface RegisterErrors {
  name?: string
  lastName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  termsAccepted?: string
  submit?: string
}

export interface RegisterRequest {
  name: string
  lastName: string
  email: string
  phone: string
  password: string
}

/**
 * Valida o formulário de registro
 * @param formData Dados do formulário
 * @returns Objeto com erros encontrados (vazio se válido)
 */
export function validateRegisterForm(formData: RegisterFormData): RegisterErrors {
  const errors: RegisterErrors = {}

  if (!formData.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (formData.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Sobrenome é obrigatório'
  } else if (formData.lastName.trim().length < 3) {
    errors.lastName = 'Sobrenome deve ter pelo menos 3 caracteres'
  }

  if (!formData.email.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!/^\S+@\S+$/.test(formData.email)) {
    errors.email = 'Email inválido'
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Telefone é obrigatório'
  } else {
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 11) {
      errors.phone = 'Telefone inválido'
    }
  }

  if (!formData.password) {
    errors.password = 'Senha é obrigatória'
  } else if (formData.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória'
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem'
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = 'Você precisa aceitar os termos de uso'
  }

  return errors
}

/**
 * Formata o telefone no padrão brasileiro (XX) XXXXX-XXXX
 * @param value Valor do telefone
 * @returns Telefone formatado
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  } else if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }
}

/**
 * Converte os dados do formulário para o formato da API
 * @param formData Dados do formulário
 * @returns Dados formatados para a API
 */
export function formatRegisterRequest(formData: RegisterFormData): RegisterRequest {
  return {
    name: formData.name.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.replace(/\D/g, ''),
    password: formData.password
  }
}

