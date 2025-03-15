# Biblioteca Digital

Bem-vindo à Biblioteca Digital, um sistema completo para gerenciamento de livros digitais. Este projeto foi desenvolvido utilizando Node.js, Express, Knex.js e EJS, e permite que usuários registrem, façam login, visualizem livros disponíveis, baixem e leiam livros virtualmente. Administradores têm permissões adicionais para gerenciar os livros disponíveis na biblioteca.

## Funcionalidades

### Usuários
- **Registro e Login**: Criação de conta e autenticação de usuários.
- **Visualização de Livros**: Acesso à lista de livros disponíveis na biblioteca.
- **Detalhes do Livro**: Visualização de informações detalhadas sobre cada livro.
- **Download de Livros**: Download de livros em formato PDF.
- **Leitura Virtual**: Leitura de livros diretamente no navegador.
- **Favoritos**: Adicionar e remover livros dos favoritos.
- **Avaliação de Livros**: Avaliar livros com uma nota.

### Administradores
- **Dashboard**: Painel de controle com visão geral da biblioteca.
- **Gerenciamento de Livros**:
  - Adicionar novos livros
  - Editar livros existentes
  - Remover livros

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL (produção), SQLite (testes)
- **ORM**: Knex.js
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Autenticação**: Bcrypt.js, Express-session
- **Upload de Arquivos**: Multer
- **Segurança**: Helmet
- **Testes**: Jest, Supertest

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL

## Instalação

1. Clone o repositório:
    ```sh
    git clone https://github.com/seu-usuario/biblioteca-digital.git
    cd biblioteca-digital
    ```

2. Instale as dependências:
    ```sh
    npm install
    ```

3. Configure o banco de dados:
    - Crie um banco de dados MySQL e atualize as informações de conexão no arquivo `.env`.

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:
    ```
    PORT=3333
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua-senha
    DB_NAME=biblioteca_digital
    SECRET_KEY=sua-chave-secreta
    ```

5. Execute as migrações e seeds para criar as tabelas e popular o banco de dados:
    ```sh
    npx knex migrate:latest
    npx knex seed:run
    ```

6. Inicie o servidor:
    ```sh
    npm start
    ```

7. Execute os testes:
    ```sh
    npm test
    ```

## Seeds
As seeds são usadas para popular o banco de dados com dados iniciais. Aqui está um exemplo de seed para a tabela users:

```js
// filepath: src/seeds/01_users.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    await knex('users').del();
    const hashedPassword = await bcrypt.hash('senha123', 12);
    await knex('users').insert([
        {
            id: 1,
            name: 'Administrador',
            email: 'acervodelivrosdigitalsaberes@gmail.com',
            password: hashedPassword,
            role: 'admin',
            nickname: 'Administrador',
            email_verified: true, 
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 2,
            name: 'User',
            email: 'user@example.com',
            password: hashedPassword,
            role: 'user',
            nickname: 'user123',
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);
=======
# Biblioteca Digital

Bem-vindo à Biblioteca Digital, um sistema completo para gerenciamento de livros digitais. Este projeto foi desenvolvido utilizando Node.js, Express, Knex.js e EJS, e permite que usuários registrem, façam login, visualizem livros disponíveis, baixem e leiam livros virtualmente. Administradores têm permissões adicionais para gerenciar os livros disponíveis na biblioteca.

## Funcionalidades

### Usuários
- **Registro e Login**: Criação de conta e autenticação de usuários.
- **Visualização de Livros**: Acesso à lista de livros disponíveis na biblioteca.
- **Detalhes do Livro**: Visualização de informações detalhadas sobre cada livro.
- **Download de Livros**: Download de livros em formato PDF.
- **Leitura Virtual**: Leitura de livros diretamente no navegador.
- **Favoritos**: Adicionar e remover livros dos favoritos.
- **Avaliação de Livros**: Avaliar livros com uma nota.

### Administradores
- **Dashboard**: Painel de controle com visão geral da biblioteca.
- **Gerenciamento de Livros**:
  - Adicionar novos livros
  - Editar livros existentes
  - Remover livros

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL (produção), SQLite (testes)
- **ORM**: Knex.js
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Autenticação**: Bcrypt.js, Express-session
- **Upload de Arquivos**: Multer
- **Segurança**: Helmet
- **Testes**: Jest, Supertest

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL

## Instalação

1. Clone o repositório:
    ```sh
    git clone https://github.com/seu-usuario/biblioteca-digital.git
    cd biblioteca-digital
    ```

2. Instale as dependências:
    ```sh
    npm install
    ```

3. Configure o banco de dados:
    - Crie um banco de dados MySQL e atualize as informações de conexão no arquivo `.env`.

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:
    ```
    PORT=3333
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua-senha
    DB_NAME=biblioteca_digital
    SECRET_KEY=sua-chave-secreta
    ```

5. Execute as migrações e seeds para criar as tabelas e popular o banco de dados:
    ```sh
    npx knex migrate:latest
    npx knex seed:run
    ```

6. Inicie o servidor:
    ```sh
    npm start
    ```

7. Execute os testes:
    ```sh
    npm test
    ```

## Seeds
As seeds são usadas para popular o banco de dados com dados iniciais. Aqui está um exemplo de seed para a tabela users:

```js
// filepath: src/seeds/01_users.js
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    await knex('users').del();
    const hashedPassword = await bcrypt.hash('senha123', 12);
    await knex('users').insert([
        {
            id: 1,
            name: 'Administrador',
            email: 'admin@email.com',
            password: hashedPassword,
            role: 'admin',
            nickname: 'Administrador',
            email_verified: true, 
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 2,
            name: 'User',
            email: 'user@example.com',
            password: hashedPassword,
            role: 'user',
            nickname: 'user123',
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);
};
