/**
 * @module lib/errors
 */

 module.exports = {
     USER_IS_REQUIRED : {
         code : 1000,
         message : "the user is required"
     },
     USERNAME_EMPTY :{
         code : 1001,
         message : "username is required"
     },
     USER_PASSWORD_EMPTY : {
         code : 1002,
         message : "The user password should no be empty"
     },
     AUTHENTICATION_ERROR :{
         code : 1003,
         message : "Incorrect user/password"
     }
 }