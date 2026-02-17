import { Ride } from "../models/ride.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getAddressCoordinate,
  getCaptainsInTheRadius,
} from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";

const createRide = asyncHandler(async (req, res) => {
  const { userId, pickup, destination, vehicleType } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId not found login or creat account first");
  }
  if (
    [pickup, destination, vehicleType].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(402, "All fields are requeired");
  }

  try {
    const ride = await Ride.create({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });
    if (!ride) {
      throw new ApiError(500, "Ride does not created Internal server error");
    }

    const pickupCoordinates = await getAddressCoordinate(pickup);
    if (!pickupCoordinates) {
      throw new ApiError(402, "Pickup address not found");
    }

    const captainInRedius = await getCaptainsInTheRadius(
      pickupCoordinates.lat,
      pickupCoordinates.lng,
      2,
    );

    if (!captainInRedius) {
      throw new ApiError(404, "There are no captain found on this location");
    }

    ride.otp = "";

    const rideWithUser = await Ride.findOne({ _id: ride._id }).populate("user");

    captainInRedius.forEach((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
});
