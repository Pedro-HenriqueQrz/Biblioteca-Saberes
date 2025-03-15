const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');

// Rota para a home do usuário
router.get('/', authMiddleware.isAuthenticated, bookController.listBooks);

// Rota para a página de detalhes do livro
router.get('/book/:id', authMiddleware.isAuthenticated, bookController.bookDetails);

// Rota para listar todos os livros
router.get('/all-books', authMiddleware.isAuthenticated, bookController.listAllBooks);

// Rota para a página de atualização de perfil
router.get('/profile', authMiddleware.isAuthenticated, userController.profileForm);
router.post('/profile', authMiddleware.isAuthenticated, userController.updateProfile);

// Rota para a página de leitura do livro
router.get('/books/download/:id', authMiddleware.isAuthenticated, bookController.downloadBook);
router.get('/books/read/:id', authMiddleware.isAuthenticated, bookController.readBook);

// Rota para adicionar um comentário
router.post('/book/:id/comment', authMiddleware.isAuthenticated, bookController.addComment);

// Rota para avaliar um livro
router.post('/book/:id/rate', authMiddleware.isAuthenticated, bookController.rateBook);

// Rota para deletar um comentário
router.post('/book/:bookId/comment/:commentId/delete', authMiddleware.isAuthenticated, bookController.deleteComment);

// Rota para adicionar/remover favoritos
router.post('/book/:id/favorite', authMiddleware.isAuthenticated, bookController.addFavorite);
router.post('/book/:id/unfavorite', authMiddleware.isAuthenticated, bookController.removeFavorite);

// Rota para listar favoritos
router.get('/favorites', authMiddleware.isAuthenticated, bookController.listFavorites);

// Rota para a página do usuário
router.get('/user', authMiddleware.isAuthenticated, (req, res) => {
    res.render('user/dashboard', { user: req.session.user });
});

// Rota para a página "Como Publicar"
router.get('/como-publicar', (req, res) => {
    res.render('user/comoPublicar');
});

// Middleware para capturar rotas não encontradas (404)
router.use((req, res) => {
    res.status(404).render('404'); // Renderiza a página 404.ejs
});

module.exports = router;