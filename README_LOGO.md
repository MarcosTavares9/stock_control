# Como Adicionar a Logo

## Localização dos Arquivos

Coloque sua logo em uma das seguintes pastas:

### Opção 1: Pasta `public/assets/` (Recomendado)
- Crie a pasta: `public/assets/`
- Coloque sua logo: `public/assets/logo.svg` ou `public/assets/logo.png`
- Use no código: `/assets/logo.svg` ou `/assets/logo.png`

### Opção 2: Pasta `src/shared/assets/`
- Crie a pasta: `src/shared/assets/`
- Coloque sua logo: `src/shared/assets/logo.svg` ou `src/shared/assets/logo.png`
- Importe no código: `import logo from '../../../shared/assets/logo.svg'`

## Onde a Logo Aparece

### 1. Página de Login (`src/features/login/ui/Login.tsx`)
- Descomente a linha com `<img src="/assets/logo.svg" ... />` no `login-header`

### 2. Página de Registro (`src/features/register/ui/Register.tsx`)
- Descomente a linha com `<img src="/assets/logo.svg" ... />` no `register-header`

### 3. Sidebar (`src/shared/components/layout/Sidebar.tsx`)
- Pode adicionar logo no lugar do texto "CE" ou "Controle de Estoque"

### 4. Header (`src/shared/components/layout/Header.tsx`)
- Pode adicionar logo ao lado do título se desejar

## Formato Recomendado

- **SVG**: Melhor qualidade e escalabilidade
- **PNG**: Com fundo transparente, tamanho recomendado: 200x200px ou 300x100px (dependendo do formato)

## Exemplo de Uso

```tsx
// Em Login.tsx ou Register.tsx
<img src="/assets/logo.svg" alt="Logo" className="login-logo" />
```

Ou se usar import:

```tsx
import logo from '../../../shared/assets/logo.svg'

<img src={logo} alt="Logo" className="login-logo" />
```


