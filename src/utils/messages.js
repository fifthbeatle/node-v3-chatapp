const generateMsg = (msgText, username) => {
    return {
        text: msgText,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMsg = (location, username) => {
    return {
        url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}