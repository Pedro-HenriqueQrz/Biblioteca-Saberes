process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const adminRoutes = require('../routes/adminRoutes');
const knex = require('../database/db');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: false,
}));

// Middleware para autenticar como administrador durante os testes
app.use((req, res, next) => {
    req.session.user = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin'
    };
    next();
});

app.use('/admin', adminRoutes);

describe('Admin Controller', () => {
    beforeAll(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });

    afterAll(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });

    it('should list books for admin', async () => {
        const response = await request(app).get('/admin/livros');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Livro Exemplo'); // Verifica se o título do livro está presente na resposta
    });

    it('should add a new book', async () => {
        // Verifica se os arquivos existem, caso contrário, cria arquivos temporários
        const coverImagePath = path.join(__dirname, '../public/uploads/default.jpg');
        const bookFilePath = path.join(__dirname, '../public/books/exemplo.pdf');
        if (!fs.existsSync(coverImagePath)) {
            fs.writeFileSync(coverImagePath, ''); // Cria um arquivo temporário vazio
        }
        if (!fs.existsSync(bookFilePath)) {
            fs.writeFileSync(bookFilePath, ''); // Cria um arquivo temporário vazio
        }

        const response = await request(app)
            .post('/admin/novolivro')
            .field('title', 'Novo Livro')
            .field('author', 'Autor Exemplo')
            .field('genre', 'Ficção')
            .field('description', 'Descrição do novo livro')
            .attach('cover_image', coverImagePath)
            .attach('book_file', bookFilePath);

        expect(response.status).toBe(302); // Redirecionamento após adicionar o livro
    });

    it('should update a book', async () => {
        // Verifica se os arquivos existem, caso contrário, cria arquivos temporários
        const coverImagePath = path.join(__dirname, '../public/uploads/default.jpg');
        const bookFilePath = path.join(__dirname, '../public/books/exemplo.pdf');
        if (!fs.existsSync(coverImagePath)) {
            fs.writeFileSync(coverImagePath, ''); // Cria um arquivo temporário vazio
        }
        if (!fs.existsSync(bookFilePath)) {
            fs.writeFileSync(bookFilePath, ''); // Cria um arquivo temporário vazio
        }

        const response = await request(app)
            .post('/admin/editar/1')
            .field('title', 'Livro Atualizado')
            .field('author', 'Autor Atualizado')
            .field('genre', 'Ficção')
            .field('description', 'Descrição atualizada')
            .attach('cover_image', coverImagePath)
            .attach('book_file', bookFilePath);

        expect(response.status).toBe(302); // Redirecionamento após atualizar o livro
    });

    it('should delete a book', async () => {
        const response = await request(app).post('/admin/remover/1');
        expect(response.status).toBe(302); // Redirecionamento após remover o livro
    });
});