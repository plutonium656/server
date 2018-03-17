var mongoose = require('mongoose');
//SCHEMA
var boardSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    moderators:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
    threads:[{
        type:mongoose.Schema.ObjectId,
        ref:'Thread'
    }]

});

var Board = module.exports = mongoose.model('Board',boardSchema);
