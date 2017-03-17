'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);
const logger = require('../logger');
//log error if connection fails
Mongoose.connection.on('error', error => {
    logger.log('error','mongo error'+error);
});

//create a schema that defines the document structure for storing data
const chatUser = new Mongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String,
});

//Turn the schema into a usable model
let userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
    Mongoose,
    userModel
};