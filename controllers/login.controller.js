const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { User, UserInfo } = require("../models/user.model")

const loginRouter = require('express').Router();
const validateLoginRouter = require('express').Router();

loginRouter.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((response) => {
        if (response == null) {
            return res.send({ acknowledged: false, msg: "Incorrect email or password" })
        }

        bcrypt.compare(password, response.password, (err, bool) => {
            if (err)
                return res.send({ acknowledged: false, msg: "Something went wrong, please try again later" })

            if (bool == false) {
                return res.send({ acknowledged: false, msg: "Incorrect email or password" })
            } else {
                let userData = {id: response._id }

                let token = jwt.sign(userData, process.env.SECRET_KEY);
                res.send({ acknowledged: true, token: token, msg: "Login Successful" })
            }
        })
    })
})


validateLoginRouter.post("/api/login/validate", (req, res) => {
    const token = req.body.token;
    
    if (token == null || token == undefined) {
        return res.status(401).send({ acknowledged: false });
    } else {
        
        jwt.verify(token, process.env.SECRET_KEY, (er, decode) => {
            if (er) {
                return res.status(401).send({ acknowledged: false });
            }

            User.findOne({ _id: decode.id }).then((response) => {

                if (response !== null) {
                    UserInfo.findOne({ userId: response.id }).then((data) => {
                        let userInfo = {
                            id: response.id,
                            username: response.username,
                            firstname: response.firstname,
                            lastname: response.lastname,
                            email: response.email,
                            profile: data.profile || "/assets/images/profile.svg",
                            bio: data.biography,
                            date: response.date
                        }

                        return res.send({ acknowledged: true, data: userInfo})
                    })
                } else {
                    return res.status(401).send({ acknowledged: false, msg: "Validation failed" })
                }

            }).catch((er) => {
                console.error(er)
            })
        })

    }
})


module.exports = {
    validateLoginRouter,
    loginRouter
}