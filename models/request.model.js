const mongoose = require('mongoose')

const FriendRequest = mongoose.model("friend-requests", mongoose.Schema({
    to: { type: "String", required: true },
    from: { type: "String", required: true },
    date: { type: "Date", default: Date.now }
}))

module.exports = FriendRequest