# Plano de Desenvolvimento — Sistema de Gestão de Biblioteca Digital

## 👥 Integrantes da Dupla

- Nome 1: **[Seu Nome Aqui]**
- Nome 2: **[Nome do Parceiro]**

## 🧠 Descrição do Projeto

API e Frontend de um sistema de empréstimo e leitura de livros digitais com controle de usuários, empréstimos, recomendações, histórico e autorização por papéis.

---

## ✅ Requisitos da Proposta

### Funcionalidades obrigatórias:

- [x] Autenticação com dois métodos (ex: login + token)
- [x] Três tipos de usuários: Admin, Bibliotecário e Leitor
- [x] Autorização baseada em papéis (roles)
- [ ] Validação de dados (`express-validator`)
- [ ] Testes automatizados com **Jest**
- [x] API RESTful consumida por frontend externo
- [x] Conexão com banco de dados (MongoDB)
- [ ] Controle de tempo de empréstimo
- [ ] Lista de espera para livros populares
- [ ] Histórico de leitura
- [ ] Upload de PDFs (simulado)
- [ ] Recomendações baseadas em leitura
- [ ] Deploy em ambiente de produção (Heroku, Render, etc)
- [ ] README final com informações completas

---

## 🛠️ Tecnologias Usadas

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- JWT para autenticação
- Dotenv
- Nodemon

### Frontend (a definir ou já implementado)
- [ ] React (ou outra lib/framework)
- [ ] Axios para consumir API

### Testes
- [ ] Jest
- [ ] Supertest (para testar rotas)

---

## 🚧 O que ainda falta implementar?

### Backend
- [ ] Middleware de verificação de roles
- [ ] Validadores com `express-validator`
- [ ] Upload simulado com `multer`
- [ ] Lógica de espera e histórico
- [ ] Recomendações com base em gênero/histórico
- [ ] Testes automatizados (TDD)

### Frontend
- [ ] Telas: Login, Cadastro, Catálogo, Meus Empréstimos
- [ ] Painéis: Admin, Bibliotecário, Leitor
- [ ] Integração com API (axios)
- [ ] Lógica condicional por tipo de usuário

---

## 🚀 Deploy (planejado)

- Backend: [Render](https://render.com) (ou Heroku, Cyclic, etc)
- Frontend: [Netlify](https://www.netlify.com), [Vercel](https://vercel.com), ou integrado

---

## 📦 Como rodar localmente

### Backend

```bash
git clone https://github.com/coisincoisadojj/projeto.git
cd projeto
npm install
npm run dev
