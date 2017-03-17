'use strict';
const express = require('express');
const app = express();
const chatCat = require('./app/index');
const passport = require('passport');


app.set('port', process.env.PORT || 3000);
//app.set('views', './views');// opcional, default = './views'
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(chatCat.session);
//passport integration with express
app.use(passport.initialize());
//hookup express session with passport
app.use(passport.session());
//log http requests
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            //write to logs
            chatCat.logger.log('info', message);
        }
    }
}));

app.use('/', chatCat.router);


let helloMiddleware = (req, res, next) => {
    req.hello = "Hello! Hellowin";
    next();
};

app.use('/dashboard',helloMiddleware);

app.get('/dashboard', (req, res, next) => {
    res.send('<h1>This is the dashboard Middleware says: ' + req.hello + '</h1>')
});

chatCat.ioServer(app).listen(app.get('port'), () => console.log('chatCat on port ', app.get('port')));
