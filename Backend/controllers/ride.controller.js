import { Ride } from "../models/ride.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getAddressCoordinate,
  getCaptainsInTheRadius,
} from "../services/maps.service.js";
import rideService from "../services/ride.service.js";
import mapService from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";
import { connect } from "mongoose";

const createRide = asyncHandler(async (req, res) => {
  const { userId, pickup, destination, vehicleType } = req.body;

  if (
    [userId, pickup, destination, vehicleType].some(
      (eachVal) => eachVal.trim() === "",
    )
  ) {
    throw new ApiError(402, "All fields are required");
  }

  try {
    const ride = await rideService.createRide({
      userId,
      pickup,
      destination,
      vehicleType,
    });
    if (!ride) {
      throw new ApiError(500, "Ride not created");
    }
    res
      .status(201)
      .json(new ApiResponse(201, ride, "Ride created successfully"));

    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

    captainsInRedius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.lat,
      pickupCoordinates.lng,
    );

    if (!captainsInRedius) {
      throw new ApiError(404, "There is no captain found in your location");
    }

    ride.otp = "";

    const rideWithUser = await Ride.findById(ride._id).populate("user");

    captainsInRedius.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

const getFare = asyncHandler(async (req, res) => {
  const { pickup, destination } = req.query;

  if (!pickup || !destination) {
    throw new ApiError(404, "Pickup and destination not found");
  }

  try {
    const fare = await rideService.getFare(pickup, destination);

    if (!fare) {
      throw new ApiError(500, "Fare does not found");
    }

    return res
      .status(201)
      .json(new ApiError(201, fare, "Fare fetched Successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

const confirmRide = asyncHandler(async (req, res) => {
  const { rideId } = req.body;

  if (!rideId) {
    throw new ApiError(402, "Rideid is required");
  }

  const ride = await rideService.confirmRide({ rideId, captain: req.captain });

  if (!ride) {
    throw new ApiError(500, "Ride is not confirm");
  }

  sendMessageToSocketId(ride.user.socketId, {
    event: "ride-confirmed",
    data: ride,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ride, "Ride confirm successfully"));
});


