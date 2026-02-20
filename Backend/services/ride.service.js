import { Ride } from "../models/ride.model.js";
import { mapService } from "../services/maps.service.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup or Destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = {
    auto: 30,
    car: 50,
    moto: 20,
  };

  const perKmRate = {
    auto: 10,
    car: 15,
    moto: 8,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    moto: 1.5,
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto,
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car,
    ),
    moto: Math.round(
      baseFare.moto +
        (distanceTime.distance.value / 1000) * perKmRate.moto +
        (distanceTime.duration.value / 60) * perMinuteRate.moto,
    ),
  };

  return fare;
}

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

const creteRide = async ({ user, pickup, destination, vehicleType }) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fare = await getFare(pickup, destination);

  if (!getFare) {
    throw new Error("Fare is not found");
  }

  const ride = await Ride.create({
    user,
    pickup,
    destination,
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  if (!ride) {
    throw new Error("Ride not Created");
  }

  return ride;
};

const rideConfirm = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("rideId is required");
  }

  await Ride.findByIdAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "accepted",
      captain: captain._id,
    },
  );

  const ride = await Ride.findOne({
    _id: rideId,
  })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }
  return ride;
};

const startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id or opt are required");
  }

  const ride = await Ride.findOne({
    _id: rideId,
  })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }
  if (ride.otp !== otp) {
    throw new Error("Invalide otp");
  }

  await Ride.findByIdAndUpdate(
    { _id: rideId },
    {
      status: "ongoing",
    },
  );
  return ride;
};

const endRide = async ({rideId, captain}) => {
    if(!rideId){
      throw new Error('Ride id are required');
    }

    const ride = await Ride.findOne({
      _id : rideId,
      captain : captain._id
    }).populate('user').populate('captain').select('+otp');

    if(!ride){
      throw new Error('Ride not found')
    }

    if(ride.status !== 'ongoin'){
      throw new Error('Ride not ongoing')
    }

    await Ride.findOneAndUpdate({
      _id : rideId
    },{
      status : "completed"
    })

    return ride;
}
