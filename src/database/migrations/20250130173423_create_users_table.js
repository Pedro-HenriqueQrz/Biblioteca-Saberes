/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('nickname').notNullable().unique();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.enu('role', ['user', 'admin']).defaultTo('user');
        table.boolean('email_verified').defaultTo(false); 
        table.string('verification_token'); 
        table.timestamps(true, true);
        table.string('reset_token');
        table.timestamp('reset_token_expires');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
