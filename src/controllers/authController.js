const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const knex = require('../database/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const saltRounds = 12; // Número adequado de rounds para bcrypt

exports.register = [
    // Validação e sanitização dos dados de entrada
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    body('nickname').trim().notEmpty().withMessage('Nickname é obrigatório'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('user/register', { errors: errors.array() });
        }

        const { name, email, password, nickname } = req.body;

        try {
            // Verificar se o email já está em uso
            const existingEmail = await knex('users').where({ email }).first();
            if (existingEmail) {
                return res.status(400).render('user/register', { errors: [{ msg: 'Email já está em uso', param: 'email' }] });
            }

            // Verificar se o nickname já está em uso
            const existingNickname = await knex('users').where({ nickname }).first();
            if (existingNickname) {
                return res.status(400).render('user/register', { errors: [{ msg: 'Nickname já está em uso', param: 'nickname' }] });
            }

            const verification_token = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await knex('users').insert({
                name,
                email,
                password: hashedPassword,
                nickname,
                role: 'user',
                verification_token,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Enviar email de verificação
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verificação de Email',
                text: `Clique no link para verificar seu email: http://localhost:3333/auth/verify-email?token=${verification_token}`
            };

            await transporter.sendMail(mailOptions);

            res.redirect('/auth/login');
        } catch (error) {
            next(error); // Passa o erro para o middleware de tratamento de erros
        }
    }
];

exports.verifyEmail = async (req, res, next) => {
    const { token } = req.query;

    try {
        const user = await knex('users').where({ verification_token: token }).first();

        if (!user) {
            return res.status(400).send('Token de verificação inválido');
        }

        await knex('users').where({ id: user.id }).update({
            email_verified: true,
            verification_token: null
        });

        res.send('Email verificado com sucesso');
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

exports.login = [
    // Validação e sanitização dos dados de entrada
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha é obrigatória'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await knex('users').where({ email }).first();
            console.log('User found:', user);

            if (!user || !await bcrypt.compare(password, user.password)) {
                console.log('Invalid email or password');
                return res.status(401).send('Email ou senha incorretos');
            }

            if (!user.email_verified) {
                console.log('Email not verified');
                return res.redirect('/auth/verify-email-prompt');
            }

            req.session.user = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            console.log('User session:', req.session.user);

            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/user');
            }
        } catch (error) {
            console.error('Login error:', error);
            next(error); // Passa o erro para o middleware de tratamento de erros
        }
    }
];

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};

exports.forgotPassword = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('user/forgotPassword', { errors: errors.array() });
        }

        const { email } = req.body;

        try {
            const user = await knex('users').where({ email }).first();
            if (!user) {
                return res.status(400).render('user/forgotPassword', { errors: [{ msg: 'Email não encontrado', param: 'email' }] });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

            await knex('users').where({ email }).update({
                reset_token: resetToken,
                reset_token_expires: resetTokenExpires
            });

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Redefinição de Senha',
                text: `Clique no link para redefinir sua senha: http://localhost:${process.env.PORT}/auth/reset-password?token=${resetToken}`
            };

            await transporter.sendMail(mailOptions);

            res.send(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                text-align: center;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Email Enviado</h1>
                            <p>Um email com instruções para redefinir sua senha foi enviado.</p>
                        </div>
                    </body>
                </html>
            `);
        } catch (error) {
            next(error);
        }
    }
];

exports.resetPasswordForm = async (req, res, next) => {
    const { token } = req.query;

    try {
        const user = await knex('users').where('reset_token', token).andWhere('reset_token_expires', '>', new Date()).first();

        if (!user) {
            return res.status(400).send(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                text-align: center;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Token Inválido ou Expirado</h1>
                            <p>O token de redefinição de senha é inválido ou expirou. Por favor, solicite um novo token.</p>
                        </div>
                    </body>
                </html>
            `);
        }

        res.render('user/resetPassword', { token, errors: [] });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = [
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('user/resetPassword', { token: req.body.token, errors: errors.array() });
        }

        const { token, password } = req.body;

        try {
            const user = await knex('users').where('reset_token', token).andWhere('reset_token_expires', '>', new Date()).first();

            if (!user) {
                return res.status(400).send(`
                    <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    margin: 0;
                                }
                                .container {
                                    background-color: #fff;
                                    padding: 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                    text-align: center;
                                }
                                h1 {
                                    color: #333;
                                }
                                p {
                                    color: #666;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>Token Inválido ou Expirado</h1>
                                <p>O token de redefinição de senha é inválido ou expirou. Por favor, solicite um novo token.</p>
                            </div>
                        </body>
                    </html>
                `);
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await knex('users').where('id', user.id).update({
                password: hashedPassword,
                reset_token: null,
                reset_token_expires: null
            });

            res.send(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                text-align: center;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Senha Redefinida</h1>
                            <p>Sua senha foi redefinida com sucesso.</p>
                            <a>href="/auth/login">Clique aqui para fazer login</a>
                        </div>
                    </body>
                </html>
            `);
        } catch (error) {
            next(error);
        }
    }
];