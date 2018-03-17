var mongoose = require('mongoose');
//SCHEMA
var commentSchema = mongoose.Schema({
    author:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    content:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

var Comment = module.exports = mongoose.model('Comment',commentSchema);