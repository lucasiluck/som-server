# SOM Server - API para Sistema de Ordens de Serviço

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?style=for-the-badge&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange?style=for-the-badge&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-purple?style=for-the-badge&logo=jsonwebtokens)

## 📝 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [Configuração](#-configuração)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Principais Rotas](#-principais-rotas)
- [População de Dados](#-população-de-dados)
- [Autor](#-autor)

## 📖 Sobre o Projeto
Este projeto é uma API RESTful desenvolvida como parte do trabalho de conclusão do curso de Análise e Desenvolvimento de Sistemas (ADS). A API gerencia ordens de serviço, clientes, técnicos, serviços e agendamentos para o Sistema de Ordens de Serviço (SOM).

## ✨ Tecnologias
Esta API foi construída utilizando as seguintes tecnologias e bibliotecas:
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express**: Framework para construção de APIs.
- **Sequelize**: ORM para Node.js, compatível com MySQL.
- **MySQL**: Sistema de gerenciamento de banco de dados.
- **JSON Web Tokens (JWT)**: Para autenticação e autorização baseada em tokens.
- **bcryptjs**: Biblioteca para hashing de senhas.
- **dotenv**: Para gerenciamento de variáveis de ambiente.

## 🚀 Instalação e Execução
Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos
- Node.js (versão 14 ou superior)
- MySQL

### Passos
1. Clone o repositório:
   ```sh
   git clone <url-do-repositorio>
   cd som-server
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Configure as variáveis de ambiente (veja a seção [Configuração](#-configuração)).

4. Execute o servidor:
   Em modo de desenvolvimento (com hot-reload):
      ```sh
      npm run dev
      ```
   Em modo de produção:
      ```sh
      npm start
      ```

O servidor estará disponível em `http://localhost:3000` (ou na porta definida no seu arquivo `.env`).

## 🔧 Configuração
Antes de iniciar o servidor, é necessário configurar as variáveis de ambiente.

1. Crie um arquivo chamado `.env` na raiz do projeto.
2. Copie e cole o conteúdo abaixo, substituindo pelos seus dados:
   ```ini
   # Configurações do Banco de Dados
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=seu_usuario
   DB_PASS=sua_senha
   DB_NAME=som_db

   # Chave secreta para JWT
   JWT_SECRET=sua_chave_secreta_super_segura

   # Porta da aplicação
   PORT=3000
   ```
Certifique-se de que o banco de dados `som_db` foi criado no seu servidor MySQL.

## 📁 Estrutura de Pastas
A estrutura de pastas do projeto foi organizada para manter o código modular e de fácil manutenção.
```
.
├── config/             # Configurações (ex: conexão com DB)
│   └── db.js
├── controllers/        # Lógica de negócio e controle das rotas
├── middleware/         # Funções intermediárias (ex: autenticação)
├── models/             # Definições dos modelos do Sequelize
├── routes/             # Definição das rotas da API
├── app.js              # Arquivo principal da aplicação Express
├── populate_db.js      # Script para popular usuários
├── populate_ordens.js  # Script para popular ordens e agendamentos
├── populate_services.js# Script para popular serviços
├── ordens.json         # Dados para popular ordens
├── .env                # Arquivo de variáveis de ambiente (não versionado)
└── package.json
```

## 🗺️ Principais Rotas
A API possui os seguintes endpoints principais:

| Método | Rota | Descrição | Requer Autenticação? |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autentica um usuário. | Não |
| `POST` | `/api/auth/register` | Registra um novo usuário. | Não |
| `GET` | `/api/clientes` | Lista todos os clientes. | Sim |
| `POST` | `/api/clientes` | Cria um novo cliente. | Sim |
| `GET` | `/api/tecnicos` | Lista todos os técnicos. | Sim |
| `POST` | `/api/tecnicos` | Cria um novo técnico. | Sim |
| `GET` | `/api/servicos` | Lista todos os serviços. | Sim |
| `POST` | `/api/servicos` | Cria um novo serviço. | Sim |
| `GET` | `/api/ordens` | Lista todas as ordens de serviço. | Sim |
| `POST` | `/api/ordens` | Cria uma nova ordem de serviço. | Sim |
| `GET` | `/api/agenda` | Lista todos os agendamentos. | Sim |
| `POST` | `/api/agenda` | Cria um novo agendamento. | Sim |

*Endpoints de `PUT`, `DELETE` e `GET /:id` também estão disponíveis para cada recurso.*

## 📦 População de Dados
Para facilitar os testes, foram criados scripts para popular o banco de dados com dados de exemplo.

- Para popular usuários (clientes e técnicos):
  ```sh
  node populate_db.js
  ```
- Para popular serviços:
  ```sh
  node populate_services.js
  ```
- Para popular ordens de serviço e agendamentos:
  ```sh
  node populate_ordens.js
  ```

## 👨‍💻 Autor
Desenvolvido por **Lucas Matheus Carvalho**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-carvalho-79b850165/)
