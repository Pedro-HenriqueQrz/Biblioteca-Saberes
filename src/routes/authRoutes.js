const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const bookController = require('../controllers/bookController');

// Rotas de autenticação
router.get('/login', (req, res) => {
    console.log('GET /auth/login');
    res.render('user/login');
});
router.post('/login', authController.login);
router.get('/register', (req, res) => {
    console.log('GET /auth/register');
    res.render('user/register', { errors: [] });
});
router.post('/register', [
    // Validação e sanitização dos dados de entrada
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres').trim().escape(),
    body('nickname').trim().notEmpty().withMessage('Nickname é obrigatório'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('user/register', { errors: errors.array() });
    }
    next();
}, authController.register);
router.get('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail);
router.get('/verify-email-prompt', (req, res) => {
    console.log('GET /auth/verify-email-prompt');
    res.render('user/verifyEmailPrompt');
});

// Rotas de recuperação de senha
router.get('/forgot-password', (req, res) => {
    res.render('user/forgotPassword', { errors: [] });
});
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password', authController.resetPasswordForm);
router.post('/reset-password', authController.resetPassword);

// Rotas de autenticação com Google
router.get('/google', (req, res, next) => {
    console.log('GET /auth/google');
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    (req, res, next) => {
        console.log('GET /auth/google/callback');
        next();
    },
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
        console.log('Google login successful');
        req.session.user = req.user;
        res.redirect('/user');
    }
);

// Rotas de Políticas de Privacidade e Termos de Serviço
router.get('/privacy-policy', (req, res) => {
    console.log('GET /auth/privacy-policy');
    res.render('user/privacyPolicy');
});
router.get('/terms-of-service', (req, res) => {
    console.log('GET /auth/terms-of-service');
    res.render('user/termsOfService');
});

router.get("/", authMiddleware.isAuthenticated, bookController.listBooks);

module.exports = router;