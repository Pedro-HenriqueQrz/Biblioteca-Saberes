const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");
const bookController = require("../controllers/bookController"); // Adicione esta linha

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'book_file' && file.mimetype === 'application/pdf') {
            cb(null, path.join(__dirname, '../public/books'));
        } else if (file.fieldname === 'cover_image' && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
            cb(null, path.join(__dirname, '../public/uploads'));
        } else {
            cb(new Error('Tipo de arquivo não permitido'), false);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'book_file' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else if (file.fieldname === 'cover_image' && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas JPEG, PNG e PDF são aceitos.'));
    }
};

const upload = multer({ storage, fileFilter });

router.get('/', authMiddleware.isAdmin, adminController.dashboard);
router.get("/dashboard", authMiddleware.isAdmin, adminController.dashboard);
router.get("/livros", authMiddleware.isAdmin, adminController.listBooks);
router.get("/novolivro", authMiddleware.isAdmin, adminController.newBookForm);
router.post("/novolivro", authMiddleware.isAdmin, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'book_file', maxCount: 1 }]), adminController.addBook);
router.get("/editar/:id", authMiddleware.isAdmin, adminController.editBookForm);
router.post("/editar/:id", authMiddleware.isAdmin, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'book_file', maxCount: 1 }]), adminController.updateBook);
router.post("/remover/:id", authMiddleware.isAdmin, adminController.deleteBook);

router.get('/comments', authMiddleware.isAdmin, adminController.listComments);
router.post('/comments/:commentId/delete', authMiddleware.isAdmin, bookController.adminDeleteComment);

module.exports = router;