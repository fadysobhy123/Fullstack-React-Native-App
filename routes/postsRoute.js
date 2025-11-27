const express = require('express');
const router = express.Router();
const postController = require('../controllers/postsController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.post('/create',authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
router.get('/with-users', postController.getPostsWithUsers);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
