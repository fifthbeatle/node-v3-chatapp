const users = []

const addUser = ({ id, username, roomname }) => {
    //clean the data
    username = username.trim().toLowerCase()
    roomname = roomname.trim().toLowerCase()

    //validate the data
    if(!username || !roomname) {
        return {
            error: 'User name and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.roomname == roomname && user.username == username
    })

    if(existingUser) {
        return {
            error: 'User name already exists in the room.'
        }
    }

    //store user
    const user = { id, username, roomname }
    users.push(user)

    return {
        user
    }

}

const removeUser = (id) => {
    const index = users.findIndex((u) => {
        return u.id == id
    })
    if(index > -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((u) => u.id == id)
}

const getUsersInRoom = (roomname) => {
    return users.filter((u) => u.roomname == roomname)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}