

# 🚀 File Ingestion and processing service 

API para upload, listagem e remoção de arquivos, construída com **NestJS**, **Prisma**, **PostgreSQL** e **AWS S3**, seguindo princípios de **Clean Architecture** e com cobertura completa de testes.

---

## 📌 Tecnologias

* Node.js / NestJS
* Prisma ORM
* PostgreSQL
* AWS S3
* Jest (unit, integration, e2e)
* Swagger


## 🧩 Funcionalidades

* Upload de arquivos (JPEG e PDF)
* Listagem de arquivos
* Exclusão de arquivos
* Validações encapsuladas em entidades
* Use Cases isolando regras de negócio
* Controllers enxutos
* Repository com abstração de acesso ao banco
* Testes cobrindo todas as camadas


## 📦 Instalação

```bash
npm install
```

## 🌱 Variáveis de Ambiente

```
PG_DATABASE_URL=postgresql://user:password@localhost:5432/dev_db
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## ▶️ Rodando o Projeto

### Banco de dados

```bash
docker compose up -d 
```

### Desenvolvimento

```bash
npm run start:dev
```


## 🧪 Testes

### Unitários

```bash
npm run test:unit
```

### Integração

```bash
npm run test:integration
```

### E2E

```bash
npm run test:e2e
```

### Rodar tudo

```bash
npm run test:all
```


## 🧱 Estrutura 

```
src/
├── domain/
│   ├── entities/
│   ├── services/
│   └── repositories/
├── application/
│   └── use-cases/
└── infra/
    └── controllers/
```

---



## 📄 Swagger

Depois de rodar o projeto:

👉 [http://localhost:3000/api](http://localhost:3000/api)
