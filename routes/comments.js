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


router.put('/api/b/:board/threads/:id/:commentId', ensureToken, (req,res) => {
    jwt.verify(req.token, secretKey, function(err, data) {
        if(err)
        {
            res.send(err);
        }
        else {
            Comment.findById(req.params.commentId, (err, comment) => {
                if(err){
                   console.log('ERROR: '+err);
                }
                comment.content = req.body.content;
                comment.save((err, updatedComment) => {
                    if(err){
                        res.send(err);
                    }
                    res.json(updatedComment);
                })
            });
        }
    });
});

router.post('/api/b/:board/threads/:id', ensureToken,(req,res) => {
    jwt.verify(req.token, secretKey, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            let comment = new Comment({
                author:req.body.userId,
                content:req.body.content
            });
            comment.save((err,_comment) => {
                Thread.findOneAndUpdate({_id:req.params.id},{$push:{comments:_comment._id}}, (err,_result) => {
                    if(err){
                        res.json(err);
                    }
                    res.json(_result);
                });
            })

        }
    });
});
router.delete('/api/b/:board/threads/:id/:commentId', ensureToken, (req,res) => {
    jwt.verify(req.token, secretKey, (err,data) => {
        if(err){
            res.json(err);
        } else {
            Comment.remove({_id:req.params.commentId}, (err,_q) => {
                if(err){
                    res.json(err);
                }
                Thread.findById(req.params.id, (err,thread) => {
                    const idx = thread.comments.indexOf(req.params.commentId);
                    thread.comments.splice(idx,1);
                    thread.save((err,_updatedThread) => {
                        res.sendStatus(200);
                    });
                });
            });
        }
    });
});

module.exports = router;