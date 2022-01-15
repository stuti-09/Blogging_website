const fs = require('fs');
const path = require('path');
const {validationResult}=require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const req = require('express/lib/request');
const { json } = require('body-parser');

exports.getPosts=(req,res,next)=>{
    Post.find()
    .then(posts=>{
        res.status(200).json({message: 'Fetched posts.',posts: posts});
    })
    .catch(err =>{
        if(!err.statusCode){ 
            err.statusCode= 500;
        }
        next(err);
    });

};
exports.createPost=(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error= new Error('No image provided');
        error.statusCode= 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    post
    .save()
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user =>{
        creator = user;
        user.posts.push(post);
        return user.save();
        
    })
    .then(result =>{
        res.status(201).json({
            message:'post created successfully',
            post:post,
            creator: {_id: creator._id, name: creator.name}
            
        });
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });
   
};
exports.getPost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find Post.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'post fetched',post:post});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });
};
exports.updatePost =(req,res,next)=>{
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl= req.file.path;
    }
    if(!imageUrl){
        const error = new Error('no file picked');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find Post.');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl!== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title=title;
        post.imageUrl=imageUrl;
        post.content= content;
        return post.save();
    })
    .then(result =>{
        res.status(200).json({ message :'Post updated!', post:result});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });
};
const clearImage = filePath =>{
    filePath = path.join(__dirname, '..',filePath);
    fs.unlink(filePath, err => console.log(err));
};
exports.deletePost =(req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find Post.');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result =>{
        return User.findById(req.userId);
    })
    .then(user =>{
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        
        res.status(200).json({ message: 'post deleted'});
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });

};
exports.likePosts=(req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find Post.');
            error.statusCode = 404;
            throw error;
        }
        if(!post.likes.includes(req.userId)){
            post.likes.push(req.userId);
            post.save();
            
        }
        else{
            return res.status(400).json({message:"already liked"});
        }
        return res.status(200).json({message:"the Post has been liked"});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });
};
exports.searchPost=(req,res,next)=>
{
    const text = req.body.text;
    Post.find({ title: { $regex: text, $options: "xi"} })
    .then(post=>{
        if(!post){
            res.status(404).json({Error:"no post found"});
        }
        else{
            res.status(200).json({post:post});
        }
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });

};