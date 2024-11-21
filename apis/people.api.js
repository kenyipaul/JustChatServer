const { User, UserInfo } = require("../models/user.model")
const FriendRequest = require("../models/request.model")

const peopleRouter = require("express").Router();
const addFriendRouter = require('express').Router();
const friendRequestsRouter = require("express").Router();

const acceptFriendRouter = require("express").Router();
const declineFriendRouter = require('express').Router();

peopleRouter.post('/api/people', (req, res) => {
    let userId = req.body.userId;

    if (User !== "" || userId !== null) {
        User.find({_id: { $ne: userId }}).then((response) => {
            
            let promises = response.map((user) => {
                return UserInfo.findOne({ userId: user._id }).then((data) => {
                    return {
                        id: user.id,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        profile: data.profile
                    }
                })
            })

            Promise.all(promises).then((data) => {
                res.send({ acknowledged: true, data})
            })
        })
    }
})


// FRIENDS 

friendRequestsRouter.post("/api/people/get/friendrequests", (req, res) => {

    let userId = req.body.userId;

    FriendRequest.find({ to: userId }).then((response) => {
        let promises = response.map((request) => {
            return User.findOne({ _id: request.from }).then((response) => {
                return {
                    id: response._id,
                    username: response.username,
                    firstname: response.firstname,
                    lastname: response.lastname
                }
            })
        })

        Promise.all(promises).then((data) => {
            let promises = data.map((user) => {
                return UserInfo.findOne({ userId: user.id }).then((info) => {
                    return {
                        id: user.id,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        profile: info.profile
                    }
                })
            })


            Promise.all(promises).then((data) => {
                res.send(data)
            })
        })
    })

})


addFriendRouter.post("/api/people/add/friend", (req, res) => {
    
    const { to, from } = req.body

    UserInfo.findOne({ userId: to }).then((response) => {
        let friends = response.friends

        for (let i = 0; i < friends.length; i++) {
            for (let j = 0; j < friends[i].length; j++) {
                if (friends[i][j] == from) {
                    return res.send({ acknowledged: false, msg: "You are already friends" })
                }
            }
        }

        FriendRequest.findOne({ $or: [{ to: from, from: to }, { to: to, from: from  }] }).then((response) => {
            if (response !== null) {
                if ( response.to == to) {
                    return res.send({ acknowledged: false, msg: "Friend request already sent" })
                } else if (response.to == from) {
                    return res.send({ acknowledged: false, msg: "User has already sent you a friend request" })
                } 
            } else {
                FriendRequest.create({ to, from }).then((response) => {
                    return res.send({ acknowledged: true, msg: "Friend request sent successfully" })
                })
            }
        })
    })

    
})




acceptFriendRouter.post("/api/people/accept/friend", (req, res) => {
    const { userId, senderId } = req.body;
  
    UserInfo.findOneAndUpdate({ userId: userId }, {$push: { friends: senderId }}).then(() => {
        UserInfo.findOneAndUpdate({ userId: senderId }, {$push: { friends: userId }}).then(() => {
            
            FriendRequest.deleteMany({ $or: [{ to: userId, from: senderId }, { to: senderId, from: userId }] }).then((response) => {
                return res.send({ acknowledged: true })
            })
        })
    })
})

declineFriendRouter.post("/api/people/decline/friend", (req, res) => {
    const { userId, senderId } = req.body;

    FriendRequest.deleteOne({ to: userId, from: senderId }).then((response) => {
        return res.send({ acknowledged: true, deleteCount: 1, msg: "Friend request deleted successfully" })
    })
})


module.exports = {
    peopleRouter,
    addFriendRouter,
    acceptFriendRouter,
    declineFriendRouter,
    friendRequestsRouter
}