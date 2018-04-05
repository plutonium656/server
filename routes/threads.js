var express = require("express");
var router = express.Router();
var ensureToken = require("../middelware/authorization");
var logApiCall = require("../middelware/logRequest");
var jwt = require("jsonwebtoken");
var secretKey = 'my_secret_key';

Thread = require("../models/thread");
User = require("../models/user");
Comment = require("../models/comment");
Board = require("../models/board");
Apicall = require("../models/apicall");


router.get('/api/b/:board/threads/:id', ensureToken, function (req, res) {
    jwt.verify(req.token, secretKey, function (err, data) { //TODO: make secretKey ENV VAR
        if (err) {
            res.sendStatus(403);
        } else {
            //if auth successful
            let thread = Thread.findOne({_id:req.params.id}).populate({
                path:'comments',
                populate:{path:'author'}
            }).populate('author').exec((err, result) => {
                if(err){
                    res.json(err);
                }
                res.json(result);
            });
        }
    });
});

router.post('/api/b/:board/threads', ensureToken, function (req, res) {
    jwt.verify(req.token, secretKey, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            let thread = new Thread({
                title:req.body.title,
                content:req.body.content,
                author:req.body.userId,
            });
            thread.save((err,thr) => {
                if(err){
                    res.json(err);
                }
                Board.findOneAndUpdate({name:req.params.board}, {$push: {threads:thr._id}},(err,result) =>{
                    if(err){
                        res.json(err);
                    }
                    res.json(thr);
                });
            });
        }
    });

});
router.delete('/api/b/:board/threads/:id', ensureToken, (req,res) => {
    jwt.verify(req.token, secretKey, (err,data) => {
        if(err){
            res.send(err);
        }
        else {
            Thread.remove({_id:req.params.id}, (err,_result) => {
                if(err){
                    res.json(err);
                }
                    Board.find({name:req.params.board},(err,board) => {
                        if(err){
                            console.log(err);
                            res.send(err);
                        }
                        const idx = board.threads.indexOf(req.params.id);
                        board.threads.splice(idx,1);
                        board.save((err,updatedBoard)=> {
                            if(err){
                                res.send(err);
                            }
                                console.log(updatedBoard);
                                res.json(updatedBoard);
                        });
                    })
                
            });
        }
    });
});
router.put('/api/b/:board/threads/:id', ensureToken, (req,res) => {
    jwt.verify(req.token, secretKey, (err,data) => {
        if(err){
            res.send(err);
        }
        else {
            Thread.findById(req.params.id, (err,thread) => {
                if(err){
                    res.send(err);
                } else {
                    thread.title = req.body.title;
                    thread.content = req.body.content;
                    thread.save((err, updatedThread) => {
                        if(err){
                            res.send(err);
                        } else {
                            res.json(updatedThread);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;