const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controllers = require('./api/controllers');
const cors = require('cors');
const middlewares = require('./api/middlewares');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const seedDB = require('./db/seed');

const port = process.env.PORT || 3000;
const mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost/ieeeAttendanceDB';

mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    app.use(cors());
    // {
    //     origin: 'http://127.0.0.1:5500',
    //     credentials: true
    // }
    
    app.use(bodyParser.json());
    app.use(cookieParser());

    //seedDB();
    app.get('/',(req,res) => {
        res.send('success');
    })
    app.post('/signin',controllers.signin);
    app.get('/attendance',middlewares.authenticateToken,controllers.getAttendanceData);
    app.post('/attendance',middlewares.authenticateToken,controllers.markAttendance);
    app.get('/signout',controllers.signout);
    app.get('/attendance/date',middlewares.authenticateToken,controllers.getSpecificAttendance);

    app.listen(port,() => {
        console.log(`server is running on port:${port}`);
    });
});


