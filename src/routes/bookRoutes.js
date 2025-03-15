const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.listBooks);
router.get('/:id', bookController.bookDetails);
router.get('/download/:id', bookController.downloadBook);
router.get('/read/:id', bookController.readBook);

module.exports = router;