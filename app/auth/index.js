'use strict';
const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const logger = require('../logger');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
    
    passport.serializeUser((user, done) => {
        //creates a session with the local user id
        done(null, user.id);
    });

    //run when authorization ends
    passport.deserializeUser((id,done) => {
        //find the user USING THE _id
        h.findById(id)
            .then(user => done(null, user))//req.user
            .catch(error=>logger.log('error','error deserializing user'+error));
    });
    let authProcesor = (accessToken, refreshToken, profile, done) => {
        //find a user usinf profile.id
        h.findOne(profile.id)
            .then(result => {
                if (result) {
                    done(null, result);
                } else {
                    //create a new user
                    h.createNewUser(profile)
                        .then(newChatUser => done(null, newChatUser))
                        .catch(error => logger.log('error','Error when creating user'+ error));
                }
            });
    }
    passport.use(new FacebookStrategy(config.fb, authProcesor));
    passport.use(new TwitterStrategy(config.tw, authProcesor));
};