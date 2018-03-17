var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    jwt = require("jsonwebtoken"),
    cors = require("cors"),
    secretKey = secretKey;

app.use(bodyParser.json());
app.use(cors());
//MODELS
Thread = require("./models/thread");
User = require("./models/user");
Comment = require("./models/comment");
Board = require("./models/board");

//Mongoose setup
//mongoose.connect('mongodb://yannik:roflk0wski@ds251727.mlab.com:51727/my_task_list_yannik');
mongoose.connect('mongodb://localhost:27017/rclone');
var db = mongoose.connection;

//useless index route lol
app.get('/', function (req, res) {
    res.send('Nothing to see here =)');
});

app.post('/api/login', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) throw err;

        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) throw err;

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
app.get('/api/authservice', ensureToken,(req,res) => {
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
            res.send(err);
        }
        res.json(user);
    });
});
//##################### USERS BEGIN
app.post('/api/user', function (req, res) {
    var newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
    });
    newUser.save(function (err, _user) {
        if (err) throw err;
        res.json(_user);
    });
});
//##################### USERS END
//##################### BOARD BEGIN
app.get('/api/b/',(req,res) => {
    Board.find((err,_boards) => {
        if(err){
            res.json(err);
        }
        res.json(_boards);
    });
});
app.post('/api/b/new', ensureToken,(req,res)=>{
    jwt.verify(req.token, secretKey, function (err, data) { //TODO: make secretKey ENV VAR
        if (err) {
            res.json(err);
        } else {
            var newBoard = new Board({
                name:req.body.name,
                description:req.body.description,
                owner:req.body.ownerId,
                moderators:[body.ownerId]
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
app.get('/api/b/:board', (req,res) => {
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
//##################### BOARD END
//##################### THREADS BEGIN
/* 
    Refactor ALL routes to support the new 'Board' parameter
    we will use the 'Board' model to first find the right board and respond with the data that the client asked for

*/

app.get('/api/b/:board/threads/:id', ensureToken, function (req, res) {
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

app.post('/api/b/:board/threads', ensureToken, function (req, res) {
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
app.delete('/api/b/:board/threads/:id', ensureToken, (req,res) => {
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
app.put('/api/b/:board/threads/:id', ensureToken, (req,res) => {
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
//##################### THREADS END

//##################### COMMENTS BEGIN
app.put('/api/b/:board/threads/:id/:commentId', ensureToken, (req,res) => {
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

app.post('/api/b/:board/threads/:id', ensureToken,(req,res) => {
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
app.delete('/api/b/:board/threads/:id/:commentId', ensureToken, (req,res) => {
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
//##################### COMMENTS END

//##################### Middleware Begin
function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}
//##################### Middleware END

app.listen(80, function (err) {
    if (err) {
        throw err;
    }
    console.log("server listening on port 80");
});