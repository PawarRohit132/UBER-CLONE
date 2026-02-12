import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const captianSchema = new mongoose.Schema({
    fullname : {
        firstname : {
            type : String,
            required : true,
            
        },
        lastname : {
            type : String
        }
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique :true,
        match : [/@/, 'Please  enter a valid email']
    },
    password : {
        type : String,
        required : true,
        select : false,
    },
    socketId : {
        type : String
    },
    status : {
        type : String,
        enum : ['active', 'inactive'],
        default : 'inactive'
    },
    accessToken : {
        type : String
    },
    vehicle : {
        color : {
            type : String,
            required : true,

        },
        plate : {
            type : String,
            required : true
        },
        capacity : {
            type: Number,
            required: true,
        },
        vehicleType : {
            type : String,
            required : true,
            enum : ["car","bike", "auto" ]
        }
    },
    location : {
        ltd : {
            type : Number
        },
        lng : {
            type : Number
        }
    }
}, {timestamps : true});

captianSchema.methods.generateAuthToken = function(){
    const token = jwt.sign(
        {_id : this._id},
        process.env.OTUkcy_90_rohit_pawar12345,
        {expiresIn : "24h"}
    )
    return token
};

captianSchema.pre("save", async function(next){
    try {
        if(this.isModified("password")){
            this.password = await bcrypt.hash(this.password, 10)
            return next();
        }
        else{
            return next();
        }
    } catch (error) {
        console.log(error);
        
    }
});

captianSchema.methods.comparePassword = async function(password){
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.log(error);
        
    }
};

export const Caption = mongoose.model("Caption", captianSchema);