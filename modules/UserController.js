module.exports = function() {

    this.user = require('../models/User');
    this.redis      = require('./Redis');

    this.addUser = function(email, password) {
        var user = new this.user();
        var userSchema = user.userSchema;
        userSchema.password = user.generateHash(password);
        userSchema.lastLogin = new Date();
        userSchema.email = email;

        var redis = new this.redis();
        var userJSON = JSON.stringify(userSchema);
        redis.getClient().hset(["user_storage", email, userJSON], function(err, results) {
            if(err) {
                return console.error(err);
            }
        });

        return userSchema;
    }

    this.findUserByEmailPassword = function(email, password, callback) {
        var redis = new this.redis();
        redis.getClient().hexists(['user_storage', email], function(err, results) {
            if(err) {
                return console.error(err);
            }

            if(results) {
                redis.getClient().hget(['user_storage', email], function(err, results) {
                    if(err) {
                        return console.error(err);
                    }

                    if(results) {
                        //Parse results from database (redis)
                        var user = JSON.parse(results);

                        //Set class with passwords ( a bit tricky, but Redis fault)
                        var userClass = require('../models/User');
                        var userSchema = new userClass();

                        if(userSchema.validPassword(user.password, password)) {
                            callback(user);
                        }else {
                            callback(false);
                        }
                    }
                })
            }else {
                callback(false);
            }
        })
    }

    this.findUserByEmail = function(email, callback) {
        var redis = new this.redis();
        redis.getClient().hexists(['user_storage', email], function(err, results) {
            if(err) {
                return console.error(err);
            }
            if(results) {
                redis.getClient().hget(['user_storage', email], function(err, results){
                    if(err) {
                        return console.error(err);
                    }
                    var user = JSON.parse(results);
                    callback(user);
                })
            }else {
                callback(false);
            }
        })
    }

}