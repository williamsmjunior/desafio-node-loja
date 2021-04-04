/**
 * @module lib/user.model
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password : {
        type: String,
        required :true
    },
    permissions : {
        type: Array,
        required: false
    }
});

UserSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model("User", UserSchema);