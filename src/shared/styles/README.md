# Sistema de Design

Este diretório contém o sistema de design do projeto, incluindo variáveis de cores, tipografia, espaçamentos e mixins reutilizáveis.

## Estrutura

- `variables.sass` - Variáveis de cores, espaçamentos, tipografia e outros tokens de design
- `mixins.sass` - Mixins reutilizáveis para tipografia, botões, cards, etc.
- `index.sass` - Arquivo principal que importa todas as variáveis e mixins

## Uso

Para usar as variáveis e mixins em seus arquivos SASS:

```sass
@import '../../styles/variables'
@import '../../styles/mixins'

.meu-componente
  background-color: $primary-500
  color: $white
  @include text-base
  padding: $spacing-md
```

## Cores

### Primária (Azul Claro)
- `$primary-50` até `$primary-900` - Escala de azul claro
- Cor padrão: `#3B82F6`

### Neutras
- `$gray-50` até `$gray-900` - Escala de cinza
- `$white` e `$black` - Cores base

### Semânticas
- `$success` - Verde (#10B981)
- `$warning` - Amarelo (#F59E0B)
- `$error` - Vermelho (#EF4444)
- `$info` - Azul (#3B82F6)

## Tipografia

### Fontes
- Família: `Inter` (Google Fonts)
- Pesos: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Mixins de Texto
- `@include text-xs` - 12px
- `@include text-sm` - 14px
- `@include text-base` - 16px
- `@include text-lg` - 18px
- `@include text-xl` - 20px
- `@include text-2xl` - 24px
- `@include text-3xl` - 30px

## Espaçamentos

- `$spacing-xs` - 4px
- `$spacing-sm` - 8px
- `$spacing-md` - 16px
- `$spacing-lg` - 24px
- `$spacing-xl` - 32px
- `$spacing-2xl` - 48px

## Sombras

- `$shadow-sm` - Sombra pequena
- `$shadow-md` - Sombra média
- `$shadow-lg` - Sombra grande
- `$shadow-xl` - Sombra extra grande

## Border Radius

- `$radius-sm` - 6px
- `$radius-md` - 8px
- `$radius-lg` - 12px
- `$radius-xl` - 16px
- `$radius-full` - 9999px

