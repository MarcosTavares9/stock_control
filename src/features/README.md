# Features - Arquitetura Baseada em Domínios

Esta pasta contém todas as funcionalidades do sistema organizadas por domínio (feature).

## Estrutura de uma Feature

Cada feature deve seguir esta estrutura:

```
features/nome-da-feature/
  ├── domain/          # Regras de negócio, entidades e casos de uso
  ├── infra/           # Chamadas de API e adapters
  └── ui/              # Componentes e páginas específicas da feature
```

## Regras Principais

1. **Organização por domínio**: Cada funcionalidade contém sua própria UI, lógica e infraestrutura
2. **Componentes de domínio**: Componentes que conhecem entidades ou regras específicas devem permanecer dentro da feature, mesmo sendo usados em múltiplas páginas
3. **Services/API**: Chamadas de API devem ficar dentro da pasta `infra` da feature
4. **Decisão de localização**: A decisão de onde um componente fica não é baseada em quantas páginas o utilizam, mas sim em quem é o dono da regra de negócio

## Exemplo

```
features/tickets/
  ├── domain/
  │   ├── entities/
  │   ├── use-cases/
  │   └── index.ts
  ├── infra/
  │   ├── api/
  │   ├── adapters/
  │   └── index.ts
  └── ui/
      ├── TicketsTable.tsx
      ├── TicketForm.tsx
      └── Dashboard.tsx
```

