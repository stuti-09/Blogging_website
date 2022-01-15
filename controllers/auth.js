const {validationResult}=require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
  const email= req.body.email;
  const password=req.body.password;
  const name = req.body.name;
  if(!(email && password && name)){
    const error = new Error("All fields are required !!");
    error.statusCode = 400;
    throw error;
  }
  var validemail = emailregex.test(email);

  if (!validemail) {
    const error = new Error("Enter a valid email !!");
    error.statusCode = 422;
    throw error;
}
User.findOne({email:email})
.then(user=>{
  if(user)
  {
     const error = new Error("User already exists !!");
     error.statusCode = 400;
     throw error;
  }
  else{
    bcrypt.hash(password,12)
  .then(hashedPw =>{
    const user = new User({
      email:email,
      password:hashedPw,
      name:name
    });
    return user.save();
  })
  .then(result =>{
    res.status(201).json({message: 'User created!', userId: result._id});
  })
 
  }
}) .catch(err =>{
  if(!err.statusCode){ 
      err.statusCode= 500;
  }
  next(err);
});
 
  

};

exports.login = (req, res, next) => {
   const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
  const email =req.body.email;
  const password = req.body.password;
  if(!(email && password )){
  const error = new Error("All fields are required !!");
  error.statusCode = 400;
  throw error;
}
  var validemail = emailregex.test(email);

  if (!validemail) {
  const error = new Error("Enter a valid email !!");
  error.statusCode = 422;
  throw error;
}
  let registeredUser;
  User.findOne({ email: email})
  .then(user =>{
    if(!user){
      const error = new Error('User is not registered');
      error.statusCode= 401;
      throw error;
    }
    registeredUser= user;
    return bcrypt.compare(password, user.password);
  })
  .then(isEqual =>{
    if(!isEqual){
      const error = new Error('Wrong password');
      error.statusCode= 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: registeredUser.email,
        userId: registeredUser._id.toString()
      },
      'somesupersecret',
      { expiresIn : '24h'}
    );
    res.status(200).json({ token: token, userId: registeredUser._id.toString()});
  }) 
  
    
 
  .catch(err =>{
    if(!err.statusCode){ 
        err.statusCode= 500;
    }
    next(err);
  });
};


   