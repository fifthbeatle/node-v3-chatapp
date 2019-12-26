const socket = io()

const adminUser = 'ADMIN'

//elements
const $msgForm = document.querySelector('form#submit-text')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML 
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, roomname } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const timeFormatString = 'hh.mm.ss a'

const $clientCount = document.querySelector('#client-count')

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $msgFormButton.setAttribute('disabled', 'disabled')

    const text = document.querySelector('input#input-text').value
    socket.emit('message', text, (error) => {
        $msgFormButton.removeAttribute('disabled')

        $msgFormInput.value = ''
        $msgFormInput.focus()

        if(error) {
            return console.log('ERROR: ' + error)
        }
        console.log('Message delivered')
    })
})

const autoscroll = () => {
    //get the new message element
    const $newMessage = $messages.lastElementChild

    //get the height of the new  message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //get the visible height
    const visibleHeight = $messages.offsetHeight


    //height of the messages container
    const containerHeight = $messages.scrollHeight


    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (msg) => {
    let messageClass = 'message'
    if(msg.username == adminUser) {
        messageClass += ' admin'
    }
    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        username: msg.username,
        createdAt: moment(msg.createdAt).format(timeFormatString),
        messageClass
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (msg) => {
    const html = Mustache.render(locationTemplate, {
        url: msg.url,
        username: msg.username,
        createdAt: moment(msg.createdAt).format(timeFormatString),
        messageClass: 'message'
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('clientCount', (count) => {
    $clientCount.innerText = count
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('You do not have geolocation supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            $locationButton.removeAttribute('disabled')
            if(error) {
                return console.log('Problem sending location...')
            }
            console.log('Location sent successfully!')
        })
    })
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, roomname }, (error) => {
    if(error) {
        alert(error)
        location.href('/')
    }
})