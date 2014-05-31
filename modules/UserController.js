module.exports = function() {

    this.user = require('../models/User');
    this.redis      = require('redis');
    this.redisClient = this.redis.createClient();

    /**
     * Add user
     * @param email
     * @param password
     * @returns {module.userSchema|*}
     */
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

    /**
     * Updates user.
     * Option need to contains email, to indentificate the user.
     * @param options
     */
    this.updateUser = function(options) {
        this.redisClient.hget(['user_storage', options.email], function(err, results){
            if(err) {
                return console.error(err);
            }
            results    = JSON.parse(results);
            var user   = new this.user();
            user.email      = typeof options.email     === "undefined" ? results.email : options.email;
            user.password   = typeof options.password  === "undefined" ? results.password : options.password;
            user.lastLogin  = typeof options.lastLogin === "undefined" ? results.lastLogin : options.lastLogin;
            user.room       = typeof options.room      === "undefined" ? results.room : options.room;

            var userJSON = JSON.stringify(user);

            this.redisClient.hset(["user_storage", user.email, userJSON], function(err, results){
                if(err){
                    return console.error(err);
                }
            })

        }.bind(this))
    }

    /**
     * Update user room, if not exist
     * @param email
     * @param chat
     * @param callback
     */
    this.updateUserRoom = function(email, chat, callback) {
        this.redisClient.hget(['user_storage', email], function(err, results){
            if(err) {
                return console.error(err);
            }
            results    = JSON.parse(results);
            var user   = new this.user();
            user.email      = results.email;
            user.password   = results.password;
            user.lastLogin  = results.lastLogin;
            user.room       = chat;

            var userJSON = JSON.stringify(user);

            this.redisClient.hset(["user_storage", email, userJSON], function(err, results){
                if(err){
                    return console.error(err);
                }
            })
            callback(true);
        }.bind(this))
    }

    /**
     * Simply search for user with following email and password
     * @param email
     * @param password
     * @param callback
     */
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

    /**
     * Search user with following email
     * @param email
     * @param callback
     */
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