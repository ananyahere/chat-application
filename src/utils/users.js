const users = []

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if(!username || !room) {
    return { error: 'Username and Room are required'}
  }

  // Check for existing user
  const existingUser = users.find( (user) => {
    return user.room === room && user.username === username
  })

  if(existingUser){
    return { error: 'Username is taken'}
  }

  // Store user
  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex( user => user.id === id)

  if(index !== -1){
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  const index = users.findIndex( user => user.id === id)
  return users[index]
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  const roomUsers = users.find( user => user.room === room )
  return roomUsers
}

module.exports = {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser
}
