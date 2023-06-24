const jwt=require("jsonwebtoken");
require("dotenv").config();

const authenticate=(req,res,next)=>{
    const token=req.headers.authorization;
    if(token){
        jwt.verify(token, process.env.accessToken ,(err,decoded)=>{
            if(decoded){
                req.body.user = decoded.userID;
                next()
            }
            else{
                res.status(401).send("Login again to access Notes.");
            }
        })
    }
    else{
        res.status(401).send("Not logged in!");
    }
}

module.exports={
    authenticate
}