const mongoose = require('mongoose');

var TokenScheme = new mongoose.Schema({
    token: {
        type: String,
    },
    token_type: {
        type: Number,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    mail: String,
    ip_address: String,
    browser: String,
    operation_system: String,
    location: String,
    accept_language: String,
    created_datetime: {
        type: Date,
        default: Date.now
    },
    updated_datetime: {
        type: Date
    },
    confirmed_datetime: {
        type: Date
    },
    generated_times: {
        type: String
    }
})

TokenScheme.statics.register = async function(token, token_type, user_id, mail, ip_address, browser, operation_system, location, accept_language) {
    var accessTokensData = {
        "token": token,
        "token_type": token_type,
        "user_id": user_id,
        "mail": mail,
        "ip_address": ip_address,
        "browser": browser,
        "operation_system": operation_system,
        "location": location,
        "accept_language": accept_language
    }
    try{
        var token = new AccessToken(accessTokensData)
        var savedToken = await token.save()
        return {
            "status" : 200,
            "response" : savedToken
        }
    }catch(e) {
        return {
            "status" : 409,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
}

TokenScheme.statics.findByToken = async function(token) {
    try {
        return await AccessToken.find({token : token})
    } catch (e) {
        return e.__param__.name + " : " + e.message
    }
}

TokenScheme.statics.getResetConfirmed = async function(mail) {
    try {
        return await AccessToken.findOne({mail : mail})
    } catch (e) {
        return e.__param__.name + " : " + e.message
    }
}

TokenScheme.statics.updateForgetPasswordToResetPassword = async function(mail) {
    try {
        return await AccessToken.updateOne({mail: mail}, {token_type : 4});
    } catch (e) {
        return e.__param__.name + " : " + e.message
    }
}

TokenScheme.statics.updateResetToken = async function(id, token, token_type, generated_times, ip_address, browser, operation_system, location, accept_language) {
    try {
        var findToken = await AccessToken.findOne({_id : id})
        if(findToken) {
            var updatedToken = await AccessToken.findOneAndUpdate({_id: id}, {
                    token : token,
                    token_type : token_type,
                    generated_times : generated_times,
                    ip_address : ip_address,
                    browser : browser,
                    operation_system : operation_system,
                    location : location,
                    accept_language : accept_language
            }, {new : true})
            return {
                "status" : 200,
                "response" : updatedToken
            }
        } else {
            return {
                "status" : 404,
                "response" : "Please Login First"
            }
        }
    } catch (e) {
        console.log(e);
        
        return {
            "status" : 409,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
}

TokenScheme.statics.deleteOtherToken = async function(user_id, token) {
    try {
        var deleteRes = await AccessToken.deleteMany( { user_id :  user_id, token: {$ne : token} } )
        console.log(deleteRes);
        
        return {
            "status" : 200,
            "response" : deleteRes
        }
    } catch (e) {
        console.log(e);
        
        return {
            "status" : 409,
            "response" : e.__proto__.name + " : " + e.message
        }
    }
    
}

TokenScheme.methods.toJSON = function() {
    var accessToken = this
    var accessTokenObj = accessToken.toObject()
    return {
        "mail": accessToken.mail,
        "token": accessToken.token
    }
};

var AccessToken = mongoose.model("accesstokens", TokenScheme)
module.exports = { AccessToken }