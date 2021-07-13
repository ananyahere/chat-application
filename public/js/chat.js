const socket = io()

// Elements
const msgForm = document.querySelector('#message-form')
const msgInput = document.querySelector('#message-input')
const locationBtn = document.querySelector('#send-location')
const msgBtn = document.querySelector('#send-message')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true } )

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = messages.offsetHeight

    // Height of Messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffSet = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
       messages.scrollTop = messages.scrollHeight
    }

}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, { 
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm a'),
    username: message.username 
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (location) => {
  console.log(location)
  const html = Mustache.render(locationMessageTemplate, { 
    url: location.url,
    createdAt: moment(location.createdAt).format('H:mm a'),
    username: location.username
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('getData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate,{
    users,
    room 
  })
  document.querySelector('#sidebar').innerHTML = html
})

msgForm.addEventListener('submit', (e) => {
  // disable
  msgBtn.setAttribute('disabled', 'disabled')
  console.log('this user sent message')
  e.preventDefault()
  const msg = e.target.elements.message.value
  socket.emit('sendMessage', msg, (error) => {
    // enable 
    msgBtn.removeAttribute('disabled')
    msgInput.value=''
    msgInput.focus()

    if(error){
      return console.log(error)
    }
    console.log('Message delivered')
  })
})


locationBtn.addEventListener('click', () => {
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser. :(')
  }

  // disable
  locationBtn.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }, () => {
      // enable
      locationBtn.removeAttribute('disabled')
      console.log('Location shared. :)')
    })
  })

})

socket.emit('join', { username, room }, (error) => {
    if(error){
      alert(error)
      location.href = "/"
    }
})

