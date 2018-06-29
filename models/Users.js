const mongoose = require('mongoose')
const TokenGenerator = require('uuid-token-generator')
const { AccessToken } = require('./AccessTokens')
const bcrypt = require('bcryptjs')
const useragent = require('useragent')
const { UserProfile } = require('./UserProfiles')

var UserSchema = new mongoose.Schema({
    mail: {
        type: String,
        trim: true,
        minlength: 1,
        unique : true
    },
    password: {
        type : String,
        minlength : 8,
    },
    usertype_id: mongoose.Schema.Types.ObjectId,
    status_flag: String,
    created_at:{
        type:Date,
        default:Date.now
    }
});



UserSchema.statics.register = async function(req) {
    var user = new User()
    var mail = req.body.mail
    
    try {
        var mailVerified = await User.findByEmail(mail);
        if(mailVerified.status === 401) {
            var regData = new User({
                mail: req.body.mail,
                password: req.body.password,
                usertype_id: req.body.usertype_id,
                status_flag: 1
            })
            var result = await regData.save()
            if(result) {
                var userProfileRes = await UserProfile.register(result._id, req.body.userprofile)
                if(userProfileRes.status == 409) {
                    return {
                        "status" : 400,
                        "response" : "Sign up failed in process. Please check your provided information"
                    }
                } else {
                    var randomToken = user.generateEightDigitRandonToken()
                    var getHeader = user.getHeaderDetail(req)

                    var tokenData = await AccessToken.register(
                        randomToken, 
                        2, 
                        result.user_id,
                        mail,
                        getHeader.ip,
                        getHeader.browser,
                        getHeader.opration_system,
                        req.body.location,
                        getHeader.accept_language
                    )

                    /** Send Mail Require */

                    return {
                        "status" : tokenData.status,
                        "x_auth" : tokenData.response.token,
                        "response" : userProfileRes.response
                    }
                }
            } else {
                return {
                    "status" : 400,
                    "response" : "Sign up failed in process. Please check your provided information"
                }
            }
            return {
                "status" : 200,
                "response" : result
            }
        } else {
            return {
                "status" : mailVerified.status,
                "response" : mailVerified.response
            }
        }
    } catch(e) {
        return {
            "status" : 502,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
}

UserSchema.statics.sign = async function(req) {
    var user = new User();   
    var mail = req.body.mail
    var password = req.body.password
    
    var mailVerified = await User.findByEmail(mail);
    if(mailVerified.status !== 200) {
        return {
            "status" : mailVerified.status,
            "response" : mailVerified.response
        }
    } else {
        if(await bcrypt.compare(password, mailVerified.user.password)) {
            var token = await user.genearteUUIDToken()
            var getHeader = user.getHeaderDetail(req)
            
            var tokenData = await AccessToken.register(
                token, 
                2, 
                mailVerified.user._id,
                mail,
                getHeader.ip,
                getHeader.browser,
                getHeader.opration_system,
                req.body.location,
                "en"
            )
            
            return {
                "status" : tokenData.status,
                "x_auth" : tokenData.response.token,
                "response" : tokenData.response
            }
        } else {
            return {
                "status" : 401,
                "response" : "Password Wrong."
            }
        }
    }
}

UserSchema.statics.resetPassword = async function(mail, req, password, confirmPassword) {
    var user = new User()

    var mailVerified = await User.findByEmail(mail)
    var deleteOtherToken = req.body.deleteOtherToken
    if(mailVerified.status !== 200) {
        return {
            "status" : mailVerified.status,
            "response" : mailVerified.response
        }
    } else {
        var findUser = await AccessToken.findByToken(req.headers.x_auth)
        if(findUser.length == 0) {
            return {
                "status" : 400,
                "response" : "Access Token Not Found"
            }
        } else {
            var resertConfirm = await AccessToken.getResetConfirmed(mail)

            if(!resertConfirm) {
                return {
                    "status" : 400,
                    "response" : "Error from ဘာမှန်းမသိတဲ့ method ;)"
                }
            } else {
                await AccessToken.updateForgetPasswordToResetPassword(mail)
                var id = resertConfirm._id
                var user_id = mailVerified.user._id
                var randomToken = user.generateEightDigitRandonToken()
                var getHeader = user.getHeaderDetail(req)
                var generated_time = ""

                if(password === confirmPassword) {
                    var tokenData = await AccessToken.updateResetToken(
                        id,
                        randomToken, 
                        4, 
                        generated_time,
                        getHeader.ip,
                        getHeader.browser,
                        getHeader.opration_system,
                        req.body.location,
                        getHeader.accept_language
                    )
                    if(tokenData.status != 200) {
                        return {
                            "status" : tokenData.status,
                            "response" : tokenData.response
                        }
                    } else {
                        // Code For Send Mail Here
                        await User.updateUserPassword(mail, password);
                        if(deleteOtherToken === true) {
                            var delRes = await AccessToken.deleteOtherToken(user_id, randomToken);
                            if(delRes.status !== 200) {
                                return {
                                    "status" : delRes.status,
                                    "response" : delRes.response
                                }
                            }
                        }
                        return {
                            "status" : 200,
                            "response" : "Password Changed Successful"
                        }
                    }
                    
                } else {
                    return {
                        "status" : 400,
                        "response" : "password and confirm password doesn't match"
                    }
                }
                
            }
        }
    }   
}

UserSchema.statics.updateUserPassword = async function(mail, password) {
    try {
        var hashPassword = await bcrypt.hash(password, 10)
        var updatePassword  = await User.update({mail : mail}, {
            password : hashPassword
        }, { new : true })
        
        return {
            "status" : 200,
            "response" : updatePassword
        }
    } catch (e) {
        console.log(e);
        
        return {
            "status" : 409,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
}

UserSchema.pre('save', function(next) {
    var user = this
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

UserSchema.methods.generateEightDigitRandonToken = function() {
    return Math.floor(10000000 + Math.random() * 90000000)
}

UserSchema.methods.isEmail = async function(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        /** ^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$ */
        return true
    }
    return false
}

UserSchema.methods.genearteUUIDToken = function() {
    const tokgen = new TokenGenerator(512, TokenGenerator.BASE71)
    return tokgen.generate()
}

UserSchema.methods.getGeneratedTime = function() {
    return new Date().toLocaleTimeString()
}

UserSchema.methods.getHeaderDetail = function(req) {
    var agent = useragent.parse(req.headers['user-agent'])
    var browser = agent.toAgent()
    var operation_system = agent.os.toString()
    var ip = req.connection.remoteAddress
    var accept_language = req.headers['accept-language']    

    return {
        "browser" : browser,
        "operation_system" : operation_system,
        "ip" : ip,
        "accept_language" : accept_language
    }
}

UserSchema.statics.findByEmail = async function(mail) {
    var user = new User()
    try {
        var findUser = await User.findOne({ mail: mail })
        if(await user.isEmail(mail)){
            if(!findUser) {
                return {
                    "status" : 401,
                    "response" : "The email address isn\'t registered."
                }
            } else {
                return {
                    "status" : 200,
                    "response" : "Alerady Registered Email!",
                    "user" : findUser
                }
            }
        } else {
            return {
                "status" : 400,
                "response" : "Your provided mail is not existed. Please provide the real email address."
            }
        }
    }catch(e){
        return {
            "status": 400,
            "response": e.__proto__.name + " : " + e.message
        }
    }
}

var User = mongoose.model("User", UserSchema);
module.exports = {User};