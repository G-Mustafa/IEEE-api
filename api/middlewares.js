const jwt = require('jsonwebtoken');

module.exports = {
    authenticateToken: function(req,res,next){
        const token = req.cookies.access_token;
        if(token == null) return res.status(401).json({err:true,msg:"you don't have access"});
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) => {
            if(err) return res.status(403).json({err:true, msg:'invalid token'});
            req.user = user;
            next();
        })

    }
}
