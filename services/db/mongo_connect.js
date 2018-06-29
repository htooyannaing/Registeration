const mongoose = require('mongoose');

const myUri = 'mongodb://localhost:27017/MyApi';
mongoose.connect(myUri, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
}).then(
    () => {console.log("Success!!")},
    err => {console.log("Can't connect mongo server!");
    }
    
);

module.exports = { mongoose };
