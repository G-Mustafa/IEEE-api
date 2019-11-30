const bcrypt = require('bcryptjs');
const User = require('../db/Schemas/User');
const jwt = require('jsonwebtoken');

function sanitize(str) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "`": '&#96;'
    };
    const reg = /[&<>"'`/]/ig;
    return str.replace(reg, (match)=>(map[match]));
}
function fetchSheet(user,date) {
    for(let i=0;i<user.attendanceSheets.length;i++){
        if(Date.parse(user.attendanceSheets[i].date) === date){
            return {err:false,payload:user.attendanceSheets[i].attendance,dept:user.department};
        }
    }
    return {err:true,dept:user.department};
}

module.exports = {
    signin:(req,res) => {
        const {name,password} = req.body;
        if(name && password){
            const sanitizedName = sanitize(name);
            let user = {};
            User.findOne({name:sanitizedName})
            .then(response => {
                if(response === null){
                    throw Error();
                }else{
                    user = response;
                    return bcrypt.compare(password, response.password);
                }
            })
            .then(result => {
                if(result){
                    const {_id} = user;
                    const accessToken = jwt.sign({_id},process.env.ACCESS_TOKEN_SECRET); 
                    res.cookie('access_token',accessToken,{
                        sameSite: "none",
                        httpOnly:true,
                        //secure:true,
                        maxAge: 3600000,
                        //path: "/attendance",
                        //domain: ""
                    }).redirect('/attendance');
                }else{
                    throw Error();
                }
            })
            .catch(() => {
                return res.json({err:true,msg:'username or password is incorrect'}).status(422);
            })
        }
    },
    markAttendance:(req,res) => {
        const memberNames = Object.keys(req.body);
        const attendance = memberNames.map(name => {
            return {name,isPresent:req.body[name]}
        });
        User.findByIdAndUpdate(req.user._id,{$addToSet: {attendanceSheets:{attendance}}})
        .then(() => res.json({err:false,msg:'attendance marked'}))
        .catch(() => res.json({err:true,msg:'failed to mark attendance'}))
    },
    getAttendanceData:(req,res) => {
        User.findById(req.user._id)
        .then(response => {
            if(response.name === 'excom') return res.json({err:false,payload:response.members,admin:true});
            res.json({err:false,payload:response.members,admin:false});
        })
        .catch(() => {
            res.json({err:true,msg:'failed to fetch data'}).status(404); 
        })
    },
    signout:(req,res) => {
        res.clearCookie('access_token',{
            sameSite: "none",
            httpOnly:true,
            //secure:true,
            maxAge: 3600000,
            //path: "/attendance",
            //domain: ""
        }).json({err:false,msg:'logout success'}).end();
    },
    getSpecificAttendance:function(req,res) {
        const date = Number(req.query.date);
        if(date){
            User.findById(req.user._id)
            .then(response => {
                if(response.name === 'excom'){
                    User.find({name: {$ne:'excom'}})
                    .then(response => {
                        const attendanceSheets = [];
                        for(let i=0;i<response.length;i++){
                            attendanceSheets.push(fetchSheet(response[i],date));
                        }
                        res.json({err:false,payload:attendanceSheets,msg:'attendance fetched successfully'})
                    })
                    .catch(() => {
                        throw Error();
                    })  
                }else{    
                    const attSheet = fetchSheet(response,date);
                    res.json({err:false,payload:[attSheet],msg:'attendance fetched successfully'});
                }
            })
            .catch(() => res.json({error:true,message:'failed to get attendance'}));
        }
    }
}