const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words') 

const { generateMsg, generateLocationMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public') 

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    io.emit('clientCount', io.engine.clientsCount)

    socket.on('join', ({ username, roomname }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            roomname
        })

        if(error) {
            return callback(error)
        }

        socket.join(user.roomname)
        socket.emit('message', generateMsg('Welcome, '+user.username+'!', 'ADMIN'))
        socket.broadcast.to(user.roomname).emit('message', generateMsg(`${user.username} has entered the chatroom!`, 'ADMIN'))
        io.to(user.roomname).emit('roomData', {
            room: user.roomname,
            users: getUsersInRoom(user.roomname)
        })


        callback()
    })

    socket.on('message', (msg, callback) => {
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }

        const user = getUser(socket.id)

        if(user) {
            io.to(user.roomname).emit('message', generateMsg(msg, user.username))
            callback()
        }

    })

    socket.on('sendLocation', (msg, cb) => {
        const user = getUser(socket.id)

        if(user) {
            io.to(user.roomname).emit('locationMessage', generateLocationMsg(msg, user.username))
            cb()
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.roomname).emit('message', generateMsg(user.username+' has left the chatroom!', 'ADMIN'))
            io.emit('clientCount', io.engine.clientsCount)

            io.to(user.roomname).emit('roomData', {
                room: user.roomname,
                users: getUsersInRoom(user.roomname)
            })
        }
    })
})



server.listen(port, () => {
    console.log('Server is listening on port: '+ port)
})