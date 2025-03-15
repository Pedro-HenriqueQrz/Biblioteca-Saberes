process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('../routes/authRoutes');
const knex = require('../database/db');

const app = express();
app.set('view engine', 'ejs'); // Adiciona a configuração do motor de visualização
app.set('views', path.join(__dirname, '../views')); // Define o diretório das views
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: false,
}));
app.use('/auth', authRoutes);

describe('Auth Controller', () => {
    beforeAll(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });

    afterAll(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });

    it('should return validation errors for invalid registration data', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                name: '',
                email: 'invalid-email',
                password: '123',
                nickname: '' // Adicionando o campo nickname
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('Nome é obrigatório'); // Verifica se a mensagem de erro está presente na resposta
        expect(response.text).toContain('Email inválido'); // Verifica se a mensagem de erro está presente na resposta
        expect(response.text).toContain('A senha deve ter pelo menos 6 caracteres'); // Verifica se a mensagem de erro está presente na resposta
        expect(response.text).toContain('Nickname é obrigatório'); // Verifica se a mensagem de erro está presente na resposta
    });

    it('should register a user with valid data', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                name: 'Pedro',
                email: 'pedro@example.com',
                password: 'senha123',
                nickname: 'pedro123' // Adicionando o campo nickname
            });

        expect(response.status).toBe(302); // Redirecionamento para a página de login
    }, 10000); // Aumenta o tempo limite para 10 segundos

    it('should return validation errors for invalid login data', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'invalid-email',
                password: ''
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(2);
    });

    it('should login a user with valid data', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'pedro@example.com',
                password: 'senha123'
            });

        expect(response.status).toBe(302); // Redirecionamento para a página do usuário
    });
});