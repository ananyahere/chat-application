const path = require('path')
const express = require('express')
const Filter = require('bad-words')
const socketio = require('socket.io')
const http = require('http')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUsersInRoom, getUser } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
  console.log('New Websocket Connection')

  socket.on('join', ( {username, room}, cb ) => {
    const { error, user } = addUser( { id:socket.id, username, room } )

    if(error){
      return cb(error)
    }
 
    socket.join(user.room)

    socket.emit('message', generateMessage("Admin",`Welcome ${username}`))
    socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${username} has joined. :)`))   
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    cb()
  })

  socket.on('sendMessage', (msg, cb) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if(filter.isProfane(msg)){
      return cb('Profanity not allowed :/')
    }

    io.to(user.room).emit('message', generateMessage(user.username, msg))
    cb()
  })

  socket.on('sendLocation', (coords, cb) => {
    const user = getUser(socket.id)
    const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
    cb()
  }) 
  
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left the room. :(`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }

  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})


