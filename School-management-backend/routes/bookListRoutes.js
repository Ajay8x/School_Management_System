const express = require('express');
const router = express.Router();
const bookListController = require('../controllers/bookListController');

router.get('/', bookListController.getBookLists);
router.get('/:id', bookListController.getBookListById);
router.post('/', bookListController.createBookList);
router.post('/import', bookListController.importBookLists);
router.put('/:id', bookListController.updateBookList);
router.delete('/:id', bookListController.deleteBookList);

module.exports = router;
