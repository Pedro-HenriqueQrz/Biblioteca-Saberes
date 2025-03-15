process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bookRoutes = require('../routes/bookRoutes');
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
app.use('/books', bookRoutes);

describe('Book Controller', () => {
    beforeAll(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });

    afterAll(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });

    it('should list books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Livro Exemplo'); // Verifica se o título do livro está presente na resposta
    });

    it('should return book details', async () => {
        const response = await request(app).get('/books/1');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Livro Exemplo'); // Verifica se o título do livro está presente na resposta
    });

    it('should return 404 for non-existent book', async () => {
        const response = await request(app).get('/books/999');
        expect(response.status).toBe(404);
    });
});