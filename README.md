# Dashboard Control

Projeto React com TypeScript e Vite para controle de estoque.

## Instalacao

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Estrutura do Projeto

```
src/
  features/          # Funcionalidades (1 pasta por feature)
    products/        # Produtos (TSX + SASS + types + service)
    categories/      # Categorias
    dashboard/       # Dashboard
    history/         # Historico
    location/        # Localizacao
    login/           # Login
    register/        # Registro
    report/          # Relatorios
    settings/        # Configuracoes (Perfil + Usuarios)
  shared/            # Codigo compartilhado
    components/      # Componentes reutilizaveis
    contexts/        # Context API (Auth, etc)
    config/          # Configuracoes (rotas, endpoints, etc)
    utils/           # Utilitarios
    styles/          # Estilos globais
```

## Documentacao- [Variaveis de Ambiente](docs/ENV_VARIABLES.md)
- [Endpoints da API](docs/API_ENDPOINTS.md)
- [Analise Dashboard Base](docs/ANALISE_DASHBOARD_BASE.md)
- [Melhorias Implementadas](docs/MELHORIAS_IMPLEMENTADAS.md)
- [Logo e Assets](docs/README_LOGO.md)
