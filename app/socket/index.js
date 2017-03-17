'use strict';
const h = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;

    allrooms.push({
        room: 'Good Food',
        roomID: '0001',
        users: []
    });
    allrooms.push({
        room: 'Cloud Computing',
        roomID: '0002',
        users: []
    });

    //listen to roomlist pipeline
    io.of('/roomlist').on('connection', (socket) => {
        console.log('socket connected to client');
        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });
        socket.on('createNewRoom', (newRoom) => {
            console.log('newRoom', newRoom);
            if (!h.findRoomByName(allrooms, newRoom)) {
                allrooms.push({
                    room: newRoom,
                    roomID: h.randomHex(),
                    users: []
                });
                //emit an updated list to creator
                socket.emit('chatRoomsList', JSON.stringify(allrooms));
                //emit an updated list to everyone
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
            }
        });
    });

    io.of('/chatter').on('connection', (socket) => {
        socket.on('join', data => {
            let usersList = h.addUserToRoom(allrooms, data, socket);
            if (usersList===undefined) {
                return;
            }
            //update
            socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
            socket.emit('updateUsersList', JSON.stringify(usersList.users));
        });

        socket.on('disconnect', () => {
            let room = h.removeUserFromRoom(allrooms, socket);
            if (room === undefined) {
                return;
            }
            socket.broadcast.to(room.roomID).emit('updateUsersList',JSON.stringify(room.users));
        });
        socket.on('newMessage', (data) => {
            socket.to(data.roomID).emit('inMessage',JSON.stringify(data));
        });
        


    });


};