exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('books').del();
    await knex('books').insert([
        {id: 1, title: 'Livro Exemplo', author: 'Autor Exemplo', genre: 'Ficção', description: 'Descrição do livro exemplo.', cover_image: '/uploads/default.jpg', book_file: '/books/exemplo.pdf', rating: 4.5}
    ]);
};