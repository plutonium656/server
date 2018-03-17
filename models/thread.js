var mongoose = require('mongoose');
//SCHEMA
var threadSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    timestamp:{
        type:Date,
        default:Date.now
    },
    comments:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'Comment'
        }
    ]
});

var Thread = module.exports = mongoose.model('Thread',threadSchema);