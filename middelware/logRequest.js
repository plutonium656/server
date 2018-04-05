module.exports = function logApiCall(req,res,next){
    console.log("new call added!");
    console.log(req);
    const apicall = new Apicall({
        route:req.headers.host,
        ip:req.ip,
        useragent:req.headers['user-agent']
    });
    apicall.save((err) => {
        if(err){
            console.log(err);
        }
        next();
    })
}