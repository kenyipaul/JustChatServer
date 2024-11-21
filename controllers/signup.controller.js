const fs = require('fs')
const bcrypt = require("bcrypt")
const multer = require('multer')
const { User, UserInfo } = require("../models/user.model")

const signupRouter = require('express').Router();
const userInfoRouter = require('express').Router();
const userPassRouter = require("express").Router();



signupRouter.post("/api/signup", (req, res) => {

    const { username, firstname, lastname, email } = req.body;

    User.create({ username, firstname, lastname, email }).then((response) => {
        UserInfo.create({
            userId: response._id
        })
        return res.send({ acknowledged: true, userId: response._id, msg: "Signup Successful" })
    }).catch((er) => {

        if (er.code && er.code == 11000) {
            let duplicateValue = Object.keys(er.keyPattern)[0]
            if (duplicateValue == "email") {
                console.log("Email address already in use")
                return res.send({ acknowledged: false, msg: "Email address already in use" })
            } else if (duplicateValue == "username") {
                console.log("Username has already been taken")
                return res.send({ acknowledged: false, msg: "Username has already been taken" })
            }
        }

        console.error(er)
    })

})



const upload = multer({ dest: "assets/images/" })

userInfoRouter.post("/api/signup/userinfo", upload.single("profileImage"), (req, res) => {
    const { userId, profileImage, bio } = req.body
    const base64Image = Buffer.from(profileImage.split(",")[1], "base64")
    let imageName = `assets/images/${new Date().getTime()}_${userId}.png`

    UserInfo.findOneAndUpdate({ userId: userId }, {
        profile: imageName,
        biography: bio,
    }).then((response) => {
        fs.writeFile(`./${imageName}`, base64Image, (err, data) => {
            if (err == null) {
                return res.send({ acknowledged: true })
            }
        })
    }).catch((er) => {
        let duplicateValue = Object.keys(er.keyPattern)[0]
        if (duplicateValue == "userId") {
            return res.status(406).send({ acknowledged: false, msg: "User information already registered" })
        }
        return res.status(500).send({ acknowledged: false,  msg: "Something went wrong, please try again later"})
    })

})



userPassRouter.post("/api/signup/userpass", (req, res) => {
    const { userId, password } = req.body;

    if (userId) {
        let hashed_password = bcrypt.hashSync(password, 10)

        User.findOneAndUpdate({ _id: userId}, { password: hashed_password }).then((response) => {
            return res.send({ acknowledged: true, msg: "Signup Successful" })
        }).catch(er => {
            return res.status(500).send({ acknowledged: false,  msg: "Something went wrong, please try again later"})
        })
    }
})



module.exports = {
    signupRouter,
    userInfoRouter,
    userPassRouter
} 