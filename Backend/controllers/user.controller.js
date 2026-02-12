import { User } from "../models/user.model.js";
import {BlacklistToken} from "../models/blacklistToken.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { act } from "react";

//Register user

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const token = generateAuthToken();

    user.accessToken = token;
    await user.save({ validateBeforeSave: false });

    return token;
  } catch (error) {
    throw new ApiError(500, "Something went wrong when generating tokens");
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.params; //get data from url

  if ([fullname, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  } //Here we check All fields are present

  try {
    const existedUser = await User.findOne({ email }); // check if user exists
  
    if (existedUser) {
      throw new ApiError(400, "This email is already exists");
    }
  
    const createdUser = await User.create({
      fullname: {
        firstname,
        lastname,
      },
      email,
      password,
    });
  
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong when register user");
    }
  
    const user = User.findById(user._id).select("-password -accessToken");
  
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User register successfully"));
  } catch (error) {
    console.log(error);
    
  }
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "email and password is required for login");
  }

  try {
    const loggedInUser = await User.findOne({ email });
  
    if (!loggedInUser) {
      throw new ApiError(404, "User does not exist");
    }
  
    const isPasswordValid = await loggedInUser.comparePassword(password);
  
    if (!isPasswordValid) {
      throw new ApiError(402, "Password is incorrect");
    }
  
    const { accessToken } = generateAuthToken(loggedInUser._id);
  
    const user = await findById(loggedInUser._id).select(
      "-password -accessToken",
    );
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(201, { user }, "User loged in successfully"));
  } catch (error) {
    console.log(error);
    
  }
});

const getUserProfile = asyncHandler(async (req, res) =>{
    return res
        .status(200)
        .json(req.user);
})

const userLogout = asyncHandler(async(req, res) =>{

    const token = req.cookies.accessToken || req.headers.authorization.split(' ')[ 1 ];

    try {
        await BlacklistToken.create({token})
    
        const user = await User.findByIdAndDelete(
            req.user._id,
            {
                $unset : {
                    accessToken : 1
                }
            },
            {new : true}
        )
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
            .status(200)
            .clearCookie("accessToken", accessToken, options)
            .json(new ApiResponse(201, {}, "User logout"))
    } catch (error) {
        console.log(error);
        
    }
})


export {generateAccessToken, userRegister, userLogin, userLogout}