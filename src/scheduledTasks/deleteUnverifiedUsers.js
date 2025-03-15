const cron = require('node-cron');
const knex = require('../database/db');

cron.schedule('0 0 * * *', async () => {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        await knex('users')
            .where('email_verified', false)
            .andWhere('created_at', '<', fifteenDaysAgo)
            .del();

        console.log('Usuários não verificados há mais de 15 dias foram deletados.');
    } catch (error) {
        console.error('Erro ao deletar usuários não verificados:', error);
    }
});