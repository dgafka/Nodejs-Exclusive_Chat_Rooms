module.exports = function() {

    /**
     * Redis module
     */
    this.redis  = require("redis"),
    /**
     * Connection to redis, client libary
     */
    this.redisClient = this.redis.createClient(),



    /**
     * Add variable to picked list
     * And removes, variables on index higher than 9, as callback
     * @param list
     * @param variable
     */
    this.listPush = function(list, variable, ltrim) {
        this.redisClient.lpush(list, variable, function(err, reply) {
            if(typeof ltrim.status !== 'undefined' && ltrim.status == 'A') {
                list.ltrim(ltrim.begin, ltrim.end);
            }
        })
    },

    /**
     * Read from picked list.
     * @param list
     * @param startingIndex
     * @param endingIndex
     */
    this.listRead = function(list, startingIndex, endingIndex, callback) {
        this.redisClient.lrange(list, startingIndex, endingIndex, callback);
    },

    /**
     * Add value to list of unique ids
     * if added value already exist, skipping it.
     * @param list
     * @param value
     */
    this.setAdd = function(list, value) {
        this.redisClient.sadd(list, value);
    },

    /**
     * Removes value from list of unique ids.
     * @param list
     * @param value
     */
    this.setRem = function(list, value) {
        this.redisClient.srem(list, value);
    },

    /**
     * Gets values from list of unique ids
     * Append results to the callback and runs it.
     * @param list
     * @param callback
     */
    this.setMembers = function(list, callback) {
        this.redisClient.smembers(list, callback);
    },

    /**
     * Returns Redis client
     * @returns {*}
     */
    this.getClient = function() {
        return this.redisClient;
    }

    this.redisClient.on('error', function(err){
        console.log("Error Redis " + err);
    })

    /**
     * Adds hash to to the table
     * @param array
     */
    this.hashAdd = function(array) {
        this.redisClient.hset(array, this.redis.print);
    }

    /**
     * Get all values at picked key hash value
     * [Only first level key]
     * @param key
     * @param callback
     */
    this.hashGetByKey = function(key, callback) {
        this.redisClient.hkeys(key, callback);
    }

    /**
     * Check, if key exist in hash table
     * [Only exactly path to the value [key,key] = value]
     * @param array
     * @param callback
     */
    this.hashKeyExist = function(array, callback) {
        this.redisClient.hexists(array, callback);
    }


    /**
     * Get values stored under picked key.
     * [Only exactly path to the value [key,key] = value]
     * @param array
     * @param callback
     */
    this.hashGetByKeys = function(array, callback) {
        this.redisClient.hget(array, callback)
    }

    /**
     * Warms up Redis, read create necessary keys in hash storage.
     */
    this.warmUpRedis = function() {
        this.userSchema = require('../models/User');
        var user = new this.userSchema('system', 'system123');
        user.password = user.generateHash('test');
        var userJSON  = JSON.stringify(user);

        this.redisClient.hset(["users", "daris@gmail.com", userJSON], this.redis.print);

    }

//    this.test = function runSample() {
//        this.redisClient.set("string key", "Hello World", function (err, reply) {
//            console.log(reply.toString());
//        });
//        this.redisClient.keys('*', function (err, keys) {
//            if (err) return console.log(err);
//
//            for(var i = 0, len = keys.length; i < len; i++) {
//                console.log(keys[i]);
//            }
//        });
//
//        this.userSchema = require('../models/User');
//        var user = new this.userSchema('test', 'test');
//        user.password = user.generateHash('test');
//        var userJSON  = JSON.stringify(user);
//
//        this.redisClient.hset(["user", "daris@gmail.com", userJSON], this.redis.print);
//        this.redisClient.hset(["hashkeytest", "hashtest2", "hashvalue2"], this.redis.print);
//        this.redisClient.hset(["hashkeytest", "hashtest3", "hashvalue2"], this.redis.print);
//        this.redisClient.hset(["hashkeytest", "hashtest3", "hashvalue2"], this.redis.print);
//        this.redisClient.hkeys("user", function (err, replies) {
//            if (err) {
//                return console.error("error response - " + err);
//            }
//
//            console.log(replies.length + " replies:");
//            replies.forEach(function (reply, i) {
//                console.log("    " + i + ": " + reply);
//            });
//        });
//
//        this.redisClient.hexists(["user", "daris@gmail.com"], function (err, reply) {
//            if (err) {
//                return console.error("error response - " + err);
//            }
//
//            console.log("This is a hexists test -->    " + reply);
//        });
//
//        this.redisClient.hget(["user", "daris@gmail.com"], function (err, reply) {
//            if (err) {
//                return console.error("error response - " + err);
//            }
//
//            console.log("This is a hexists test -->    " + reply);
//        })
//    }
}