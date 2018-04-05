var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    cors = require("cors"),
    secretKey = 'my_secret_key';

const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
//MODELS
Thread = require("./models/thread");
User = require("./models/user");
Comment = require("./models/comment");
Board = require("./models/board");
Apicall = require("./models/apicall");

//Mongoose setup

//mongoose.connect('mongodb://yannik:roflk0wski@ds251727.mlab.com:51727/my_task_list_yannik');
mongoose.connect('mongodb://localhost:27017/rclone');
var db = mongoose.connection;
app.use(logApiCall);
//Middleware-SETUP
var ensureToken = require("./middelware/authorization");
var logApiCall = require("./middelware/logRequest");
//########### ROUTER-SETUP
var boards = require("./routes/boards");
var comments = require("./routes/comments");
var threads = require("./routes/threads");
var users = require("./routes/user");

app.use("/",boards);
app.use("/",comments);
app.use("/",threads);
app.use("/",users);

//useless index route lol
app.get('/', function (req, res) {
    res.send('Contact site owner for api usage!');
});


//##################### Middleware END

app.listen(PORT, function (err) {
    if (err) {
        throw err;
    }
    console.log("server listening on port "+PORT);
});