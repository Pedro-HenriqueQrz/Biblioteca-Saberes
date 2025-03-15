/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ratings', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('book_id').unsigned().notNullable().references('id').inTable('books').onDelete('CASCADE');
        table.float('rating').notNullable();
        table.timestamps(true, true);
    }).then(() => {
        return knex.schema.table('books', (table) => {
            table.integer('ratings_count').defaultTo(0);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('books', (table) => {
        table.dropColumn('ratings_count');
    }).then(() => {
        return knex.schema.dropTable('ratings');
    });
};