# Documentação de Endpoints da API - Dashboard Control

## Base URL
```
/api
```

## Autenticação
Todos os endpoints protegidos requerem o header:
```
Authorization: Bearer {token}
```

---

## 1. Autenticação

### 1.1 Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta 200:**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "photo": "string (opcional)"
  }
}
```

**Resposta 401:**
```json
{
  "error": "Email ou senha inválidos"
}
```

---

### 1.2 Registro
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (apenas números)",
  "password": "string (mínimo 6 caracteres)"
}
```

**Resposta 201:**
```json
{
  "message": "Usuário criado com sucesso. Verifique seu email para confirmar a conta."
}
```

**Resposta 400:**
```json
{
  "error": "Erro ao criar conta",
  "details": {
    "email": "Email já cadastrado"
  }
}
```

---

### 1.3 Confirmar Registro
**POST** `/api/auth/confirm-registration/{token}`

**Parâmetros:**
- `token` (path): Token de confirmação enviado por email

**Resposta 200:**
```json
{
  "message": "Conta confirmada com sucesso"
}
```

**Resposta 400:**
```json
{
  "error": "Token inválido ou expirado"
}
```

---

## 2. Usuários

### 2.1 Listar Usuários
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 10)
- `search`: busca por nome ou email

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "string",
      "nome": "string",
      "email": "string",
      "cargo": "string (Administrador | Gerente | Operador)",
      "status": "string (ativo | inativo)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2.2 Criar Usuário
**POST** `/api/users`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "string",
  "email": "string",
  "cargo": "string (Administrador | Gerente | Operador)",
  "senha": "string (mínimo 6 caracteres)"
}
```

**Resposta 201:**
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "cargo": "string",
  "status": "ativo"
}
```

**Resposta 400:**
```json
{
  "error": "Erro ao criar usuário",
  "message": "Email já cadastrado"
}
```

---

### 2.3 Atualizar Usuário
**PUT** `/api/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID do usuário

**Body:**
```json
{
  "nome": "string (opcional)",
  "email": "string (opcional)",
  "cargo": "string (opcional)",
  "status": "string (ativo | inativo) (opcional)",
  "senha": "string (opcional, mínimo 6 caracteres)"
}
```

**Resposta 200:**
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "cargo": "string",
  "status": "string"
}
```

**Resposta 404:**
```json
{
  "error": "Usuário não encontrado"
}
```

---

### 2.4 Deletar Usuário
**DELETE** `/api/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID do usuário

**Resposta 200:**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

**Resposta 404:**
```json
{
  "error": "Usuário não encontrado"
}
```

---

### 2.5 Buscar Perfil do Usuário
**GET** `/api/users/{id}/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID do usuário

**Resposta 200:**
```json
{
  "id": "string",
  "nome": "string",
  "sobrenome": "string (opcional)",
  "email": "string",
  "telefone": "string (opcional)",
  "cnpj": "string (opcional)",
  "cargo": "string (opcional)",
  "fotoPerfil": "string (URL, opcional)"
}
```

**Resposta 404:**
```json
{
  "error": "Perfil não encontrado"
}
```

---

### 2.6 Atualizar Perfil do Usuário
**PUT** `/api/users/{id}/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID do usuário

**Body:**
```json
{
  "nome": "string",
  "sobrenome": "string (opcional)",
  "email": "string",
  "telefone": "string (opcional)",
  "cnpj": "string (opcional)",
  "cargo": "string (opcional)"
}
```

**Resposta 200:**
```json
{
  "id": "string",
  "nome": "string",
  "sobrenome": "string",
  "email": "string",
  "telefone": "string",
  "cnpj": "string",
  "cargo": "string",
  "fotoPerfil": "string"
}
```

---

### 2.7 Upload Foto de Perfil
**POST** `/api/users/{id}/profile/picture`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Parâmetros:**
- `id` (path): ID do usuário

**Body (form-data):**
- `file`: arquivo de imagem (PNG, JPEG, máximo 15MB)

**Resposta 200:**
```json
{
  "fotoPerfil": "string (URL da imagem)"
}
```

---

### 2.8 Remover Foto de Perfil
**DELETE** `/api/users/{id}/profile/picture`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID do usuário

**Resposta 200:**
```json
{
  "message": "Foto removida com sucesso"
}
```

---

## 3. Produtos

### 3.1 Listar Produtos
**GET** `/api/products`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 10)
- `search`: busca por nome ou localização
- `categoria`: filtrar por categoria
- `status`: filtrar por status (ok | baixo | vazio)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "number",
      "nome": "string",
      "categoria": "string",
      "quantidade": "number",
      "estoqueMinimo": "number",
      "localizacao": "string",
      "status": "string (ok | baixo | vazio)",
      "imagem": "string (URL, opcional)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 3.2 Buscar Produto por ID
**GET** `/api/products/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID do produto

**Resposta 200:**
```json
{
  "id": "number",
  "nome": "string",
  "categoria": "string",
  "quantidade": "number",
  "estoqueMinimo": "number",
  "localizacao": "string",
  "status": "string",
  "imagem": "string"
}
```

---

### 3.3 Criar Produto
**POST** `/api/products`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "string",
  "categoria": "string",
  "quantidade": "number",
  "estoqueMinimo": "number",
  "localizacao": "string",
  "imagem": "string (URL, opcional)"
}
```

**Resposta 201:**
```json
{
  "id": "number",
  "nome": "string",
  "categoria": "string",
  "quantidade": "number",
  "estoqueMinimo": "number",
  "localizacao": "string",
  "status": "string",
  "imagem": "string"
}
```

---

### 3.4 Criar Múltiplos Produtos
**POST** `/api/products/bulk`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "products": [
    {
      "nome": "string",
      "categoria": "string",
      "quantidade": "number",
      "estoqueMinimo": "number",
      "localizacao": "string"
    }
  ]
}
```

**Resposta 201:**
```json
{
  "created": 10,
  "failed": 0,
  "data": [
    {
      "id": "number",
      "nome": "string",
      ...
    }
  ]
}
```

---

### 3.5 Atualizar Produto
**PUT** `/api/products/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID do produto

**Body:**
```json
{
  "nome": "string (opcional)",
  "categoria": "string (opcional)",
  "quantidade": "number (opcional)",
  "estoqueMinimo": "number (opcional)",
  "localizacao": "string (opcional)",
  "imagem": "string (opcional)"
}
```

**Resposta 200:**
```json
{
  "id": "number",
  "nome": "string",
  "categoria": "string",
  "quantidade": "number",
  "estoqueMinimo": "number",
  "localizacao": "string",
  "status": "string",
  "imagem": "string"
}
```

---

### 3.6 Deletar Produto
**DELETE** `/api/products/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID do produto

**Resposta 200:**
```json
{
  "message": "Produto deletado com sucesso"
}
```

---

### 3.7 Upload Imagem do Produto
**POST** `/api/products/{id}/image`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Parâmetros:**
- `id` (path): ID do produto

**Body (form-data):**
- `file`: arquivo de imagem (PNG, JPEG)

**Resposta 200:**
```json
{
  "imagem": "string (URL da imagem)"
}
```

---

## 4. Categorias

### 4.1 Listar Categorias
**GET** `/api/categories`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "number",
      "nome": "string",
      "iconName": "string (laptop | mouse | headphones | hdd | memory | chair | print | spray | utensils | tshirt | box)"
    }
  ]
}
```

---

### 4.2 Buscar Categoria por ID
**GET** `/api/categories/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da categoria

**Resposta 200:**
```json
{
  "id": "number",
  "nome": "string",
  "iconName": "string"
}
```

---

### 4.3 Criar Categoria
**POST** `/api/categories`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "string",
  "iconName": "string (laptop | mouse | headphones | hdd | memory | chair | print | spray | utensils | tshirt | box)"
}
```

**Resposta 201:**
```json
{
  "id": "number",
  "nome": "string",
  "iconName": "string"
}
```

---

### 4.4 Atualizar Categoria
**PUT** `/api/categories/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID da categoria

**Body:**
```json
{
  "nome": "string (opcional)",
  "iconName": "string (opcional)"
}
```

**Resposta 200:**
```json
{
  "id": "number",
  "nome": "string",
  "iconName": "string"
}
```

---

### 4.5 Deletar Categoria
**DELETE** `/api/categories/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da categoria

**Resposta 200:**
```json
{
  "message": "Categoria deletada com sucesso"
}
```

**Resposta 400:**
```json
{
  "error": "Não é possível deletar categoria com produtos associados"
}
```

---

## 5. Localizações

### 5.1 Listar Localizações
**GET** `/api/locations`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `ativo`: filtrar por status (true | false)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "string",
      "nome": "string",
      "descricao": "string (opcional)",
      "ativo": "boolean"
    }
  ]
}
```

---

### 5.2 Buscar Localização por ID
**GET** `/api/locations/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da localização

**Resposta 200:**
```json
{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "ativo": "boolean"
}
```

---

### 5.3 Criar Localização
**POST** `/api/locations`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "string",
  "descricao": "string (opcional)"
}
```

**Resposta 201:**
```json
{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "ativo": true
}
```

---

### 5.4 Atualizar Localização
**PUT** `/api/locations/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parâmetros:**
- `id` (path): ID da localização

**Body:**
```json
{
  "nome": "string (opcional)",
  "descricao": "string (opcional)",
  "ativo": "boolean (opcional)"
}
```

**Resposta 200:**
```json
{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "ativo": "boolean"
}
```

---

### 5.5 Deletar Localização
**DELETE** `/api/locations/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros:**
- `id` (path): ID da localização

**Resposta 200:**
```json
{
  "message": "Localização deletada com sucesso"
}
```

**Resposta 400:**
```json
{
  "error": "Não é possível deletar localização com produtos associados"
}
```

---

## 6. Histórico

### 6.1 Listar Histórico
**GET** `/api/history`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 10)
- `tipo`: filtrar por tipo (entrada | saida | ajuste | criacao | edicao | exclusao)
- `categoria`: filtrar por categoria
- `produto`: buscar por nome do produto
- `usuario`: buscar por nome do usuário
- `dataInicio`: data inicial (formato: YYYY-MM-DD)
- `dataFim`: data final (formato: YYYY-MM-DD)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "number",
      "tipo": "string (entrada | saida | ajuste | criacao | edicao | exclusao)",
      "produto": "string",
      "categoria": "string",
      "quantidade": "number",
      "quantidadeAnterior": "number (opcional, para ajustes)",
      "quantidadeNova": "number (opcional, para ajustes)",
      "usuario": "string",
      "data": "string (ISO 8601)",
      "observacao": "string (opcional)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 7. Dashboard

### 7.1 Estatísticas Gerais
**GET** `/api/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta 200:**
```json
{
  "totalProdutos": "number",
  "produtosBaixoEstoque": "number",
  "totalEstoque": "number",
  "estatisticasPorStatus": {
    "ok": "number",
    "baixo": "number",
    "vazio": "number",
    "total": "number"
  }
}
```

---

### 7.2 Produtos com Estoque Baixo
**GET** `/api/dashboard/low-stock`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `limit`: número máximo de produtos (padrão: 10)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "number",
      "nome": "string",
      "categoria": "string",
      "quantidade": "number",
      "estoqueMinimo": "number",
      "status": "string (baixo | vazio)"
    }
  ]
}
```

---

## 8. Relatórios

### 8.1 Exportar Relatório (CSV)
**GET** `/api/reports/export/csv`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `tipo`: filtrar por tipo (entrada | saida | ajuste | criacao | edicao | exclusao)
- `categoria`: filtrar por categoria
- `dataInicio`: data inicial (formato: YYYY-MM-DD)
- `dataFim`: data final (formato: YYYY-MM-DD)

**Resposta 200:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="relatorio-YYYY-MM-DD.csv"

CSV file content
```

---

### 8.2 Exportar Relatório (Excel)
**GET** `/api/reports/export/excel`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `tipo`: filtrar por tipo
- `categoria`: filtrar por categoria
- `dataInicio`: data inicial
- `dataFim`: data final

**Resposta 200:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="relatorio-YYYY-MM-DD.xlsx"

Excel file content
```

---

### 8.3 Exportar Relatório (PDF)
**GET** `/api/reports/export/pdf`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `tipo`: filtrar por tipo
- `categoria`: filtrar por categoria
- `dataInicio`: data inicial
- `dataFim`: data final

**Resposta 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="relatorio-YYYY-MM-DD.pdf"

PDF file content
```

---

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Erro na requisição (validação, dados inválidos)
- **401 Unauthorized**: Token inválido ou ausente
- **403 Forbidden**: Usuário não tem permissão
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

---

## Formato de Erro Padrão

```json
{
  "error": "string (mensagem de erro principal)",
  "message": "string (mensagem detalhada, opcional)",
  "details": {
    "campo": "mensagem de erro específica"
  }
}
```

---

## Observações Importantes

1. **Autenticação JWT**: Todos os endpoints protegidos requerem um token JWT válido no header `Authorization`.

2. **Validação de Status**: O status dos produtos (`ok`, `baixo`, `vazio`) deve ser calculado automaticamente pela API baseado em:
   - `vazio`: quantidade === 0
   - `baixo`: quantidade > 0 && quantidade < estoqueMinimo
   - `ok`: quantidade >= estoqueMinimo

3. **Histórico Automático**: A API deve registrar automaticamente no histórico todas as operações de:
   - Criação de produtos
   - Edição de produtos
   - Exclusão de produtos
   - Entrada de estoque
   - Saída de estoque
   - Ajustes de estoque

4. **Paginação**: Endpoints que retornam listas devem suportar paginação usando `page` e `limit`.

5. **Upload de Imagens**: 
   - Formatos aceitos: PNG, JPEG
   - Tamanho máximo: 15MB
   - Retornar URL completa da imagem salva

6. **Validações**:
   - Email deve ser único
   - Nome de categoria deve ser único
   - Nome de localização deve ser único
   - Não permitir deletar categoria/localização com produtos associados

---

## Estruturas de Dados

### Produto
```typescript
{
  id: number
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
  imagem?: string
}
```

### Categoria
```typescript
{
  id: number
  nome: string
  iconName: 'laptop' | 'mouse' | 'headphones' | 'hdd' | 'memory' | 'chair' | 'print' | 'spray' | 'utensils' | 'tshirt' | 'box'
}
```

### Localização
```typescript
{
  id: string
  nome: string
  descricao?: string
  ativo: boolean
}
```

### Usuário
```typescript
{
  id: string
  nome: string
  email: string
  cargo: 'Administrador' | 'Gerente' | 'Operador'
  status: 'ativo' | 'inativo'
}
```

### Perfil do Usuário
```typescript
{
  id: string
  nome: string
  sobrenome?: string
  email: string
  telefone?: string
  cnpj?: string
  cargo?: string
  fotoPerfil?: string
}
```

### Histórico
```typescript
{
  id: number
  tipo: 'entrada' | 'saida' | 'ajuste' | 'criacao' | 'edicao' | 'exclusao'
  produto: string
  categoria: string
  quantidade: number
  quantidadeAnterior?: number
  quantidadeNova?: number
  usuario: string
  data: string (ISO 8601)
  observacao?: string
}
```

---

## Ordem de Prioridade de Implementação

1. **Alta Prioridade** (Essencial para funcionamento básico):
   - Autenticação (Login, Register, Confirm)
   - Produtos (CRUD completo)
   - Categorias (CRUD completo)
   - Localizações (CRUD completo)

2. **Média Prioridade** (Funcionalidades importantes):
   - Usuários (CRUD)
   - Perfil do Usuário
   - Histórico (Listagem com filtros)

3. **Baixa Prioridade** (Melhorias e relatórios):
   - Dashboard (Estatísticas)
   - Relatórios (Exportação)
   - Upload de imagens





