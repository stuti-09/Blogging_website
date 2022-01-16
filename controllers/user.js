const Post = require('../models/post');
const User = require('../models/user');
const {validationResult}=require('express-validator');
const bcrypt = require('bcryptjs');

exports.viewProfile =(req,res,next)=>{
    const userId= req.userId;
    User.findById(userId, 'name email')
    .then(user =>{
        if(!user){
            return res.status(400).json({Error:"user not found"});
        }
        return res.status(400).json(user);
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    }

    );
}
exports.editProfile=(req,res,next)=>{
    const userId= req.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const name= req.body.name;
    User.findById(userId)
    .then(user=>{
        if(!user)
    {
      return res.status(400).json({message:"user not found"});
    }
    user.name=name;
    user.save();
    return res.status(201).json({message:"user profile  editted successfully"});
    })
    .catch(err=>{
        if (!err.statusCode) {
          err.statusCode = 500;
          console.log(err);
        }
      });
}
exports.deleteProfile =(req,res,next)=>{
    const userId= req.userId;
    User.findById(userId)
    .then(user=>{
        if(!user){
            return res.status(400).json({message:"user not found"});
        }
        User.findByIdAndRemove(userId , err=>{
            if(err){
                return res.status(400).json({Error:"Error in deleting user"}); 
            }

        });
        return res.status(200).json({message:'user deleted'})
    })
    .catch(err=>{
        if (!err.statusCode) {
          err.statusCode = 500;
          console.log(err);
        }
      });
}