const express = require('express')
const router = express.Router()
const { User } = require('./../models/Users')

router.post('/signUp', async (req, res) => {
    try {
        var result = await User.register(req)
        var a = req.body.mail
        var b = req.body.password
        res.status(result.status).send(result.response);
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/sign', async (req, res) => {
    try{
        var result = await User.sign(req)
        res.status(result.status).header('x-auth', result.x_auth).send(result.response)
    }catch(e) {
        res.status(400).send(e.__proto__.name + " : " + e.message)
    }
})

router.post('/reset_password', async (req, res) => {
    try {
        var result = await User.resetPassword(req.body.mail, req, req.body.password, req.body.confirmPassword)
        res.status(result.status).send(result.response)
    } catch (e) {
        res.status(400).send(e.__proto__.name + " : " + e.message)
    }
})
module.exports = router;