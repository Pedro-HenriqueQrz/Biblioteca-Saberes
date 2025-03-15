const { body, validationResult } = require('express-validator');
const knex = require("../database/db");
const path = require("path");
const fs = require("fs");

exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { user: req.session.user });
};

exports.listBooks = async (req, res, next) => {
  try {
    const books = await knex("books").select("*");
    res.render("admin/books", { books, user: req.session.user });
  } catch (error) {
    console.error('Erro ao listar livros para admin:', error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

exports.newBookForm = (req, res) => {
  res.render("admin/newBook", { user: req.session.user });
};

exports.addBook = [
  // Validação e sanitização dos dados de entrada
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('author').trim().notEmpty().withMessage('Autor é obrigatório'),
  body('genre').trim().notEmpty().withMessage('Gênero é obrigatório'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, author, genre, description } = req.body;
      const cover_image = req.files.cover_image ? `/uploads/${req.files.cover_image[0].filename}` : "/uploads/default.jpg";
      const book_file = req.files.book_file ? `/books/${req.files.book_file[0].filename}` : null;

      await knex("books").insert({ title, author, genre, description, cover_image, book_file });

      res.redirect("/admin/livros");
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      next(error); // Passa o erro para o middleware de tratamento de erros
    }
  }
];

exports.editBookForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await knex("books").where({ id }).first();

    if (!book) return res.status(404).send("Livro não encontrado");

    res.render("admin/editBook", { book, user: req.session.user });
  } catch (error) {
    console.error('Erro ao obter formulário de edição de livro:', error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

exports.updateBook = [
  // Validação e sanitização dos dados de entrada
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('author').trim().notEmpty().withMessage('Autor é obrigatório'),
  body('genre').trim().notEmpty().withMessage('Gênero é obrigatório'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, author, genre, description } = req.body;
      const cover_image = req.files.cover_image ? `/uploads/${req.files.cover_image[0].filename}` : undefined;
      const book_file = req.files.book_file ? `/books/${req.files.book_file[0].filename}` : undefined;

      const updateData = { title, author, genre, description };
      if (cover_image) updateData.cover_image = cover_image;
      if (book_file) updateData.book_file = book_file;

      await knex("books").where({ id }).update(updateData);

      res.redirect("/admin/livros");
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      next(error); // Passa o erro para o middleware de tratamento de erros
    }
  }
];

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await knex("books").where({ id }).first();

    if (!book) {
      return res.status(404).send("Livro não encontrado");
    }

    // Deletar a imagem de capa
    const coverImagePath = path.join(__dirname, `../public${book.cover_image}`);
    if (fs.existsSync(coverImagePath)) {
      fs.unlinkSync(coverImagePath);
    }

    // Deletar o arquivo PDF do livro
    const bookFilePath = path.join(__dirname, `../public${book.book_file}`);
    if (fs.existsSync(bookFilePath)) {
      fs.unlinkSync(bookFilePath);
    }

    await knex("books").where({ id }).del();
    res.redirect("/admin/livros");
  } catch (error) {
    console.error('Erro ao remover livro:', error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

exports.listComments = async (req, res, next) => {
  try {
      const comments = await knex('comments')
          .join('users', 'comments.user_id', 'users.id')
          .join('books', 'comments.book_id', 'books.id')
          .select('comments.*', 'users.nickname', 'books.title as book_title');

      res.render('admin/comments', { comments, user: req.session.user });
  } catch (error) {
      console.error('Erro ao listar comentários:', error);
      next(error);
  }
};