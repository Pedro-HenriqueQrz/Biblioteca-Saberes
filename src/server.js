require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const helmet = require('helmet');
const passport = require('./config/passportConfig.js');
const knex = require('./database/db');
const authMiddleware = require('./middlewares/authMiddleware');
const app = express();

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares para lidar com formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Configuração do cookie-parser
app.use(cookieParser());

// Configuração do Helmet para segurança
app.use(helmet());

// Configuração da sessão
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 dia
            secure: false, // Defina como false para HTTP
            httpOnly: true
        }
    })
);

// Inicializar o Passport
app.use(passport.initialize());
app.use(passport.session());

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Redirecionar a rota raiz para a página de login ou home do usuário
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/user');
        }
    } else {
        res.redirect('/auth/login');
    }
});

// Middleware de tratamento de erros
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Iniciar a tarefa agendada
require('./scheduledTasks/deleteUnverifiedUsers');

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});