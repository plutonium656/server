var mongoose = require('mongoose');
//SCHEMA
var apicallSchema = mongoose.Schema({
    route:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    },
    ip:{
        type:String,
        required:true
    },
    useragent:{
        type:String,
        required:true
    }
    
});

var Apicall = module.exports = mongoose.model('Apicall',apicallSchema);