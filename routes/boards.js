var express = require('express');
var router = express.Router();
var ensureToken = require("../middelware/authorization");
var logApiCall = require("../middelware/logRequest");
var jwt = require("jsonwebtoken");
var secretKey = 'my_secret_key';

router.get('/api/b/',(req,res) => {
    Board.find((err,_boards) => {
        if(err){
            res.json(err);
        }
        res.json(_boards);
    });
});
router.post('/api/b/new', ensureToken,(req,res)=>{
    jwt.verify(req.token, secretKey, function (err, data) { //TODO: make secretKey ENV VAR
        if (err) {
            res.json(err);
        } else {
            var newBoard = new Board({
                name:req.body.name,
                description:req.body.description,
                owner:req.body.ownerId,
                moderators:[req.body.ownerId]
            })
            newBoard.save((err,_board) => {
                if(err){
                    res.json(err);
                }
                res.json(_board);
            });
        }
    });
});
router.get('/api/b/:board', (req,res) => {
    let b = Board.findOne({name:req.params.board}).
    populate({
        path:'threads',
        populate:{path:'author'}
    }).populate('owner')
    .populate('moderators')
    .exec( (err,result) => {
        if(err){
            res.json(err);
        }
        res.json(result);
    });
});

module.exports = router;