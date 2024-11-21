const mongoose = require('mongoose')

const User = mongoose.model("users", mongoose.Schema({
    username: { type: "String", required: true, unique: true },
    firstname: { type: "String", required: true },
    lastname: { type: "String", required: true },
    email: { type: "String", required: true, unique: true },
    password: { type: "String", default: "" },
    date: { type: "Date", default: Date.now }
}))

const UserInfo = mongoose.model("user-info", mongoose.Schema({
    userId: { type: "String", required: true, unique: true },
    status: { type: "String", default: "offline" },
    profile: { type: "String", default: "assets/images/profile.svg" },
    friends: { type: "Array", default: [] },
    biography: { type: "String", default: "" }
}))

module.exports = {
    User,
    UserInfo
};