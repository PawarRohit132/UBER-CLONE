import { Caption } from "../models/captain.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessToken = async (userId) => {
  try {
    const caption = await Caption.findById(userId);
    const token = generateAuthToken();

    caption.accessToken = token;
    await caption.save({ validateBeforeSave: false });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const captainRegister = asyncHandler(async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    status,
    color,
    plate,
    capacity,
    vehicleType,
  } = req.params;

  if (
    [
      firstname,
      lastname,
      email,
      password,
      status,
      color,
      plate,
      capacity,
      vehicleType,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const existedCaption = await Caption.findOne({ email });

    if (existedCaption) {
      throw new ApiError(402, "User already exist");
    }

    const captain = await Caption.create({
      fullname: {
        firstname,
        lastname,
      },
      email,
      password,
      status,
      vehicle: {
        color,
        plate,
        capacity,
        vehicleType,
      },
    });

    if (!captain) {
      throw new ApiError(500, "Something went wrong when register caption");
    }

    return res
      .status(200)
      .json(201, { captain }, "Caption register successfully");
  } catch (error) {
    console.log(error);
  }
});

const captionLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const caption = await Caption.findOne({ email });

    if (!caption) {
      throw new ApiError(404, "Caption does not exist");
    }

    const isPasswordCorrect = await caption.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new ApiError(402, "Password is inncorrect");
    }

    const { accessToken } = await generateAuthToken(caption._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(201, { caption }, "Caption login successfully"));
  } catch (error) {
    console.log(error);
  }
});

const getCaptionProfile = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(201, { captain: req.caption }, "caption profile get successfully");
  } catch (error) {
    console.log(error);
  }
});

const captionLogout = asyncHandler(async (req, res) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  try {
    await BlacklistToken.create({ token });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", accessToken, options)
      .json(201, {}, "Caption logout successfully");
  } catch (error) {
    console.log(error);
  }
});

export { captainRegister, captionLogin, getCaptionProfile, captionLogout };
