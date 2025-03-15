const path = require('path');
const knex = require('../database/db');

exports.listBooks = async (req, res, next) => {
    try {
        const categories = await knex('books').distinct('genre').pluck('genre');
        const booksByCategory = {};

        for (const category of categories) {
            booksByCategory[category] = await knex('books').where('genre', category).limit(5);
        }

        res.render('user/home', { booksByCategory, user: req.session.user });
    } catch (error) {
        console.error('Erro ao listar livros:', error);
        next(error);
    }
};


exports.listAllBooks = async (req, res, next) => {
    try {
        const { search } = req.query;
        let booksQuery = knex('books');

        if (search) {
            booksQuery = booksQuery.where(function () {
                this.where('title', 'like', `%${search}%`)
                    .orWhere('author', 'like', `%${search}%`)
                    .orWhere('genre', 'like', `%${search}%`);
            });
        }

        const books = await booksQuery;
        res.render('user/allBooks', { books, user: req.session.user });
    } catch (error) {
        console.error('Erro ao listar todos os livros:', error);
        next(error);
    }
};

exports.bookDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await knex('books').where({ id }).first();
        const comments = await knex('comments').where({ book_id: id }).join('users', 'comments.user_id', 'users.id').select('comments.*', 'users.nickname');

        if (!book) {
            return res.status(404).send('Livro não encontrado');
        }

        res.render('user/bookDetails', { book, comments, user: req.session.user });
    } catch (error) {
        console.error('Erro ao obter detalhes do livro:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const user_id = req.session.user.id;

        await knex('comments').insert({
            user_id,
            book_id: id,
            comment,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.redirect(`/user/book/${id}`);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.session.user.id;
        const userRole = req.session.user.role;

        const comment = await knex('comments').where({ id: commentId }).first();

        if (!comment) {
            return res.status(404).send('Comentário não encontrado');
        }

        if (comment.user_id === userId || userRole === 'admin') {
            await knex('comments').where({ id: commentId }).del();
            res.redirect(`/user/book/${comment.book_id}`);
        } else {
            res.status(403).send('Você não tem permissão para deletar este comentário');
        }
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        next(error);
    }
};

exports.adminDeleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        const comment = await knex('comments').where({ id: commentId }).first();

        if (!comment) {
            return res.status(404).send('Comentário não encontrado');
        }

        await knex('comments').where({ id: commentId }).del();
        res.redirect(`/admin/comments`);
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        next(error);
    }
};


exports.rateBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const user_id = req.session.user.id;

        // Verificar se o usuário já avaliou o livro
        const existingRating = await knex('ratings').where({ user_id, book_id: id }).first();

        if (existingRating) {
            // Atualizar a avaliação existente
            await knex('ratings').where({ user_id, book_id: id }).update({ rating, updated_at: new Date() });

            // Recalcular a média de avaliações
            const ratings = await knex('ratings').where({ book_id: id });
            const totalRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings / ratings.length;

            await knex('books').where({ id }).update({
                rating: averageRating,
                ratings_count: ratings.length
            });
        } else {
            // Inserir nova avaliação
            await knex('ratings').insert({
                user_id,
                book_id: id,
                rating,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Recalcular a média de avaliações
            const ratings = await knex('ratings').where({ book_id: id });
            const totalRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings / ratings.length;

            await knex('books').where({ id }).update({
                rating: averageRating,
                ratings_count: ratings.length
            });
        }

        res.redirect(`/user/book/${id}`);
    } catch (error) {
        console.error('Erro ao avaliar livro:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};


exports.downloadBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await knex("books").where({ id }).first();

        if (!book) {
            return res.status(404).send("Livro não encontrado");
        }

        const filePath = path.join(__dirname, `../public${book.book_file}`);
        res.download(filePath);
    } catch (error) {
        console.error('Erro ao baixar o livro:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

exports.readBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await knex("books").where({ id }).first();

        if (!book) {
            return res.status(404).send("Livro não encontrado");
        }

        res.render("user/readBook", { book });
    } catch (error) {
        console.error('Erro ao ler o livro:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

exports.addFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.session.user.id;

        await knex('favorites').insert({
            user_id,
            book_id: id,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.redirect(`/user/book/${id}`);
    } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        next(error);
    }
};

exports.removeFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.session.user.id;

        await knex('favorites').where({ user_id, book_id: id }).del();

        res.redirect(`/user/favorites`);
    } catch (error) {
        console.error('Erro ao remover favorito:', error);
        next(error);
    }
};

exports.listFavorites = async (req, res, next) => {
    try {
        const user_id = req.session.user.id;
        const favorites = await knex('favorites')
            .join('books', 'favorites.book_id', 'books.id')
            .where('favorites.user_id', user_id)
            .select('books.*');

        res.render('user/favorites', { favorites, user: req.session.user });
    } catch (error) {
        console.error('Erro ao listar favoritos:', error);
        next(error);
    }
};