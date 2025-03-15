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
};