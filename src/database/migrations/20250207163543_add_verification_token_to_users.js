exports.up = async function(knex) {
    const hasEmailVerifiedColumn = await knex.schema.hasColumn('users', 'email_verified');
    const hasVerificationTokenColumn = await knex.schema.hasColumn('users', 'verification_token');

    return knex.schema.table('users', (table) => {
        if (!hasEmailVerifiedColumn) {
            table.boolean('email_verified').defaultTo(false);
        }
        if (!hasVerificationTokenColumn) {
            table.string('verification_token');
        }
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
        table.dropColumn('email_verified');
        table.dropColumn('verification_token');
    });
};