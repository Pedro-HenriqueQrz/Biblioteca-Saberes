exports.up = async function(knex) {
    const hasResetTokenColumn = await knex.schema.hasColumn('users', 'reset_token');
    const hasResetTokenExpiresColumn = await knex.schema.hasColumn('users', 'reset_token_expires');

    return knex.schema.table('users', (table) => {
        if (!hasResetTokenColumn) {
            table.string('reset_token');
        }
        if (!hasResetTokenExpiresColumn) {
            table.timestamp('reset_token_expires');
        }
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
        table.dropColumn('reset_token');
        table.dropColumn('reset_token_expires');
    });
};