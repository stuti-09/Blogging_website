const express= require('express');
const userController= require('../controllers/user');
const User = require('../models/user');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.get('/profile',isAuth,userController.viewProfile);
router.post('/edit-profile',isAuth,userController.editProfile);
router.delete('/',isAuth,userController.deleteProfile);
module.exports=router;