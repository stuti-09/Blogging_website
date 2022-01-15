const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');


const router = express.Router();

router.post('/signup',[
    body('email').normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
],
authController.signup
);

router.post('/login',[
    body("email").normalizeEmail()
], authController.login);




module.exports = router;