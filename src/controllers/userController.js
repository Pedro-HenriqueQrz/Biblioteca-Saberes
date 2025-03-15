const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const knex = require('../database/db');

exports.profileForm = async (req, res, next) => {
    try {
        const user = await knex('users').where({ id: req.session.user.id }).first();
        res.render('user/profile', { user, errors: [] });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('nickname').trim().notEmpty().withMessage('Nickname é obrigatório'),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('user/profile', { user: req.body, errors: errors.array() });
        }

        const { name, nickname, password } = req.body;
        const updateData = { name, nickname };

        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        try {
            await knex('users').where({ id: req.session.user.id }).update(updateData);
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
                            <h1>Perfil atualizado com sucesso</h1>
                            <p><a href="/user">Voltar para o inicio</a></p>
                        </div>
                    </body>
                </html>
            `);

        } catch (error) {
            next(error);
        }
    }
];