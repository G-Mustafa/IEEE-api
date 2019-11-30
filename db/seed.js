const User = require('./Schemas/User');
const bcrypt = require('bcryptjs');

const seedUsers = [
    {
        name:'ali',
        password:'ali',
        designation:'leader',
        department: 'IT',
        members: ['aliya','mahrukh','sumaira']
    },
    {
        name:'waqas',
        password:'waqas',
        designation:'member',
        department: 'Marketing',
        members: ['fakhir','mustafa','hamza']
    },
    {
        name:'sara',
        password:'sara',
        designation:'designer',
        department: 'Graphic designing',
        members: ['owais','osama','yousuf']
    },
    {
        name:'excom',
        password:'excom',
        designation: 'head'
    }
];

module.exports = function(){
    bcrypt.genSalt(10)
    .then(response => {
        const usersHashPass = seedUsers.map(user => {
            return bcrypt.hash(user.password,response);
        });
        return Promise.all(usersHashPass);
    })
    .then(response => {
        for(let i=0;i<seedUsers.length;i++){
            seedUsers[i].password = response[i];
        }
        User.insertMany(seedUsers, () => {
            console.log('added seed data');
        });
    })
    .catch(err => {
        console.log('seed data not added',err);
    })
}