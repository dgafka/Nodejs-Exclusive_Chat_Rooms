var bcrypt   = require('bcrypt-nodejs');

module.exports = function() {


    this.userSchema = {
        email      : String,
        password   : String,
        lastLogin  : new Date(),
        room       : String
    }

    /** generating a hash */
    this.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    /** checking if password is valid */
    this.validPassword = function(passwordSource, passwordTypedByUser) {
        return bcrypt.compareSync(passwordTypedByUser, passwordSource);
    }

}