import axios from "axios";
import { Caption} from "../models/captain.model.js";

const getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.result[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unale to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination not found");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAutoCompleteSuggestions = async(input)=>{
    if(!input){
        throw new Error('Query is required')
    }

    const apiKey = process.env.GOOGLE_MAPS_API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if(response.data.status === 'OK'){
            return response.data.predictions.map(prediction => prediction.description).filter (value => value)
        }
        else{
             throw new Error('Unable to fetch suggestions');
        }
    } catch (error) {
        console.error(err);
        throw err;
    }
};

const getCaptainsInTheRadius = async(ltd, lng, radius) =>{
    const captains = await Caption.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;
}

export {getAddressCoordinate, getDistanceTime, getAutoCompleteSuggestions, getCaptainsInTheRadius}



