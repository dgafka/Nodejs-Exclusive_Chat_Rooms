var redis = require('../modules/Redis');

var bcrypt   = require('bcrypt-nodejs');

var userSchema = {
    id: '',
    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

};

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

exports.module = function() {

    this.addUser = function(email, password) {
        userSchema.local.email = email;
        userSchema.local.password = userSchema.generateHash(password);
        userSchema.id = email
        var redis = new this.redis();
        redis.setAdd('users', userSchema);
    }

    this.findUser = function() {

    }
}