module.exports = function() {

    this.chat = require('../models/Chat');
    this.redis      = require('redis');
    this.redisClient = this.redis.createClient();

    /**
     * Add new chat to chat rooms
     * @param name
     * @param owner
     * @returns {exports|*}
     */
    this.addChat = function(name, owner) {
        this.chat.name  = name;
        this.chat.owner = owner;
        var chatJSON = JSON.stringify(this.chat);


        this.redisClient.hset(["chat_storage", name, chatJSON], function(err, results) {
            if(err) {
                return console.error(err);
            }
        });

        return this.chat;
    }

    this.addChat = function(name, owner, messages, users) {
        this.chat.name  = name;
        this.chat.owner = owner;
        this.chat.messages = messages;
        this.chat.users = users;
        var chatJSON = JSON.stringify(this.chat);


        this.redisClient.hset(["chat_storage", name, chatJSON], function(err, results) {
            if(err) {
                return console.error(err);
            }
        });

        return this.chat;
    }

    /**
     * Find chat by name
     * @param name
     * @param callback
     */
    this.findChatByName = function(name, callback) {
        this.redisClient.hexists(['chat_storage', name], function(err, results) {
            if(err) {
                return console.error(err);
            }
            if(results) {
                this.redisClient.hget(['chat_storage', name], function(err, results){
                    if(err) {
                        return console.error(err);
                    }
                    var chat = JSON.parse(results);
                    callback(chat);
                })
            }else {
                callback(false);
            }
        }.bind(this))
    }

    /**
     * Find chat by owner and name
     * @param name
     * @param owner
     * @param callback
     */
    this.findChatByNameOwner = function(name, owner, callback) {
        this.findChatByName(name, function(results){
            if(results && results.owner == owner) {
                callback(results);
            }else {
                callback(false);
            }
        });
    }

    /**
     * Deletes chat, if possible (read, if owner of the chat)
     * @param name
     * @param owner
     */
    this.removeChat = function(name, owner) {
        this.findChatByNameOwner(name, owner, function(results){
            if(results) {
                this.redisClient.hdel(['chat_storage', name])
            }
        })
    }

    /**
     *  Adds user email to chat room
     * @param name
     * @param email
     */
    this.addUserToChat = function(name, email) {
        this.findChatByName(name, function(err, results){
            results.users.push(email);
            this.addChat(name, results.owner,  results.messages, results.users);
        }.bind(this))
    }

    /**
     * Removes user email from chat room
     * @param name
     * @param email
     */
    this.removeUserFromChat = function(name, email) {
        this.findChatByName(name, function(err, results){
            results.users.forEach(function(userEmail, index){
                if(userEmail == email) {
                    delete results.users[index];
                }
                this.addChat(name, results.owner,  results.messages, results.users);
            }.bind(this))
        }.bind(this))
    }



    this.findAllChats = function(callback) {
        var chats = [];
        this.redisClient.hkeys('chat_storage', callback);
    }

}