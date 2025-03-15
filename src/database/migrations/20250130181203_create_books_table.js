/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('books', (table) => {
        table.increments("id").primary();
        table.string("title", 255).notNullable();
        table.string("author", 255).notNullable();
        table.text("description").notNullable();
        table.string("cover_image").notNullable();
        table.string("genre", 100).notNullable();
        table.string("book_file").nullable(); 
        table.float('rating').defaultTo(0);
        table.timestamps(true, true);

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('books');
};