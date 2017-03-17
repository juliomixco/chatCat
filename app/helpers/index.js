'use strict';
const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//Iterate through the routes object
let registerRoutes = (routes, method) => {
    for (var key in routes) {
        if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
            registerRoutes(routes[key], key);
        } else {
            if (method === 'get') {
                router.get(key, routes[key]);
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key]);
            }
        }
    }
};

let route = routes => {
    registerRoutes(routes);
    return router;
}

//Find a single user based on a key
let findOne = profileID => {
    return db.userModel.findOne({
        profileId: profileID
    });
}

let createNewUser = profile => {
    return new Promise((resolve, reject) => {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        });

        newChatUser.save(error => {
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}

let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
};

//middleware tha check authentication
let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

//Find a chatroom by a given name
let findRoomByName = (allrooms, room) => {
    let findRoom = allrooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom > -1 ? true : false;
};

//Find a chatroom by a given roomid
let findRoomByID = (allrooms, roomID) => {
    return allrooms.find((element, index, array) => {
        if (element.roomID === roomID) {
            return true;
        } else {
            return false;
        }
    });


};

// UID
let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
};

let addUserToRoom = (allrooms, data, socket) => {
    //get the room object
    let getRoom = findRoomByID(allrooms, data.roomID);
    if (getRoom !== undefined) {
        if (socket.request.session.passport===undefined) {
            return;
        }
        //Get the active users id
        let userID = socket.request.session.passport.user;

        //check if the user exists in the room

        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if (element.userID === userID) {
                return true;
            } else {
                return false;
            }

        });


        if (checkUser > -1) {
            //remove the user from the room
            getRoom.users.splice(checkUser, 1);
        }
        //add the user to the room
        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic:data.userPic
        });

        //join the room channel
        socket.join(data.roomID);

        //Return the updated rooms
        return getRoom;
    }
};

let removeUserFromRoom = (allrooms, socket) => {
    for (let room of allrooms) {
        //find the user
        let findUser = room.users.findIndex((element, index, array) => {
            if (element.socketID === socket.id) {
                return true;
            } else {
                return false;
            }
        });
        if (findUser > -1) {
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);
            return room;

        }
    }
};


module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomByID,
    addUserToRoom,
    removeUserFromRoom,
}