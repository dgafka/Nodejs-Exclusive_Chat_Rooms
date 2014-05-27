module.exports = function() {

    this.user = require('../models/User');
    this.redis      = require('redis');
    this.redisClient = this.redis.createClient();

    this.addUser = function(email, password) {
        var user = new this.user();
        var userSchema = user.userSchema;
        userSchema.password = user.generateHash(password);
        userSchema.lastLogin = new Date();
        userSchema.email = email;

        var userJSON = JSON.stringify(userSchema);
        this.redisClient.hset(["user_storage", email, userJSON], function(err, results) {
            if(err) {
                return console.error(err);
            }
        });

        return userSchema;
    }

    this.findUserByEmailPassword = function(email, password, callback) {
        this.redisClient.hexists(['user_storage', email], function(err, results) {
            if(err) {
                return console.error(err);
            }

            if(results) {
                this.redisClient.hget(['user_storage', email], function(err, results) {
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
        }.bind(this))
    }

    this.findUserByEmail = function(email, callback) {
        this.redisClient.hexists(['user_storage', email], function(err, results) {
            if(err) {
                return console.error(err);
            }
            if(results) {
                this.redisClient.hget(['user_storage', email], function(err, results){
                    if(err) {
                        return console.error(err);
                    }
                    var user = JSON.parse(results);
                    callback(user);
                })
            }else {
                callback(false);
            }
        }.bind(this))
    }

}