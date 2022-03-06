import express from "express";
import passport from "passport";
const Router = express.Router()

Router.get("/api/test", passport.authenticate("jwt", {session: false}), (req, res) => {
    if(req.user) {
        return res.send(req.user)
    }
    return res.send("un auth")
})

export default Router