import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"



const userSchema = new mongoose.Schema({
    fullname : {
        firstname : {
            type : String,
            required : true,
            minlength: [ 3, 'First name must be at least 3 characters long' ],
        },
        lastname : {
            type : String,
            minlength : [ 3, 'Last name must be at least 3 characters long' ],
        }
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        unique : true
    },
    accessToken : {
        type : String
    },
    socketId : {
        type : String
    },
    
},{timestamps : true});

userSchema.methods.generateAuthToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : "24h"
        }

    )
};



userSchema.pre("save", async function(next){
    try {
        if(this.isModified("password")){
            this.password = await bcrypt.hash(this.password, 10)
            return next()
        }
        else{
            return next();
        }
    } catch (error) {
        console.log(error);
        
    }
});

userSchema.methods.comparePassword = async function(password){
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        console.log(error);
        
    }
} ;

export const User = mongoose.model("User", userSchema);


