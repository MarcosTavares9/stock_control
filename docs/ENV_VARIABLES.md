# Variáveis de Ambiente - Frontend

Crie um arquivo `.env` na raiz do projeto `stock_control` com as seguintes variáveis:

```env
# URL base da API backend
VITE_API_BASE_URL=http://localhost:3000

# Base path da aplicação (subdiretório onde a aplicação será servida)
# Exemplo: se a aplicação estiver em https://dominio.com.br/Stock-Control/
# então use: VITE_BASE_PATH=/Stock-Control
VITE_BASE_PATH=/Stock-Control

# Timeout das requisições HTTP em milissegundos
VITE_API_TIMEOUT=30000
```

## Variáveis Opcionais

Todas as variáveis têm valores padrão:
- `VITE_API_BASE_URL`: Padrão `http://localhost:3000`
- `VITE_BASE_PATH`: Padrão `/Stock-Control`
- `VITE_API_TIMEOUT`: Padrão `30000` (30 segundos)
