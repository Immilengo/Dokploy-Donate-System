# Dokploy-Donate-System

Sistema de gestão de doações com backend em Node.js/Express e frontend em Next.js.

## Estrutura do repositório

- `backend/`: API, autenticação, regras de negócio, Prisma e testes.
- `frontend/`: interface web do sistema.
- `docker-compose.yml`: orquestra banco, backend e frontend.

## Como executar

### Com Docker

1. Configure as variáveis de ambiente necessárias.
2. Execute:

```bash
docker compose up --build
```

### Em desenvolvimento

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Requisitos

- Node.js 20+ recomendado
- Docker e Docker Compose para subir tudo junto
- PostgreSQL para o backend

## Observações

- O GitHub passa a exibir este arquivo na raiz como documentação principal.
- Os READMEs de `backend` e `frontend` ajudam a navegar pelas pastas do projeto.
- O único ficheiro de referência de variáveis de ambiente deve ser o [.env.example](./.env.example) na raiz.
