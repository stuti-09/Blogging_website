const express= require('express');
const { body } = require('express-validator');
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

const router= express.Router();

router.get('/posts',feedController.getPosts);

router.post('/post',isAuth,[
   body('title')
   .trim()
   .isLength({ min: 5}),
   body('content')
   .trim()
   .isLength({ min: 5})
],
feedController.createPost);

router.get('/post/:postId',feedController.getPost);

router.put('/post/:postId',isAuth,[
   body('title')
   .trim()
   .isLength({ min: 5}),
   body('content')
   .trim()
   .isLength({ min: 5})
],feedController.updatePost);

router.delete('/post/:postId',isAuth,feedController.deletePost);

router.put('/post/:postId/like',isAuth,feedController.likePosts);

router.get('/search',feedController.searchPost);

module.exports=router;