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

router.post('/api/login', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err){
            res.json(err);
        }

        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err){
                res.json(err);
            }

            if (isMatch) {
                const token = jwt.sign({
                    user
                }, secretKey);
                res.json({
                    token: token,
                    userId: user._id
                });
            } else {
                res.json({
                    isMatch
                });
            }
        });
    });
});
router.get('/api/authservice', ensureToken,(req,res) => {
    const authorization = req.token;
    var decoded;
    try {
         decoded = jwt.verify(authorization, secretKey);
    }catch (e) {
        res.status(401).send('unauthorized');
    }
    const userId = decoded.user._id;
    User.findOne({_id:userId}).then((err,user) => {
        if(err){
            res.json(err);
        }
        res.json(user);
    });
});
//##################### USERS BEGIN
router.post('/api/user', function (req, res) {
    var newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
    });
    newUser.save(function (err, _user) {
        if (err) {
            res.json(err);
        }
        res.json(_user);
    });
});

module.exports = router;