const express = require('express')
const cors = require('cors')
const path = require("path")
const conn = require("./config/db.config")
require("dotenv").config()

const {loginRouter, validateLoginRouter} = require('./controllers/login.controller')
const { signupRouter, userInfoRouter, userPassRouter } = require('./controllers/signup.controller')
const { peopleRouter, addFriendRouter, friendRequestsRouter, declineFriendRouter, acceptFriendRouter } = require('./apis/people.api')

const app = express();
const _port = process.env.PORT

conn();


app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "50mb" }))


app.post("/api/login", loginRouter);
app.post("/api/login/validate", validateLoginRouter)

app.post("/api/signup", signupRouter);
app.post("/api/signup/userinfo", userInfoRouter)
app.post("/api/signup/userpass", userPassRouter)

app.post("/api/people", peopleRouter)
app.post("/api/people/add/friend", addFriendRouter)
app.post("/api/people/get/friendrequests", friendRequestsRouter)

app.post("/api/people/accept/friend", acceptFriendRouter)
app.post("/api/people/decline/friend", declineFriendRouter)



app.get("/assets/*", (req, res) => {
    let image = path.join("assets", req.params[0]);
    res.sendFile(image, { root: __dirname });
})

app.use((req, res) => {
    res.status(404)
    res.type('text/plain')
    res.send("404 | Not Found")
})

app.listen(_port, (err) => {
    if (err) {
        console.error(err)
        res.status(500).send({msg: "Internal Server Error"})
    } else {
        console.log(`Server running on port ${_port}`)
    }
})