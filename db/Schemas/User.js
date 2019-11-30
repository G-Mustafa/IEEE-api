const mongoose = require('mongoose');

function getdate(){
    return Date.parse(new Date().toDateString());
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    designation: { type: String, required: true },
    department: String,
    members: [String],
    attendanceSheets: [
        {
            _id:false,
            date: { type: Date, default: getdate },
            attendance:[{_id:false, name:String, isPresent:Boolean}]
        }
    ]
})

module.exports = mongoose.model('User',userSchema); 