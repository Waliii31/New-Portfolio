const { name } = require('ejs')
const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/My_Projects")


const userSchema = mongoose.Schema({
    name: String,
    description: String,
    image: String,
    webLink: String
})

module.exports = mongoose.model('user', userSchema)