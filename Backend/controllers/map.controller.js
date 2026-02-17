import {getAddressCoordinate, getDistanceTime, getAutoCompleteSuggestions} from "../services/maps.service.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const coordinates = asyncHandler(async(req, res) => {
    const {address} = req.query

    try {
        const coordinates = await getAddressCoordinate(address);
        return res
            .status(200)
            .json(new ApiResponse(200, coordinates, "get coordinates successfully"))   
    } catch (error) {
        throw new ApiError(404,'coordinates not found');
    }
})

const distanceTime = asyncHandler(async(req, res) => {
    const {origin, destination} = req.query

    if(!origin || !destination){
        throw new ApiError(402, 'Origin and Destination are required')
    }

    try {
        const distanceTime = await getDistanceTime(origin, destination);
        if(!distanceTime){
            throw new ApiError(402, 'distanceTime not found')
        }
        return res
            .status(200)
            .json(new ApiResponse(200, distanceTime, "distance time fetched successfully"))
    } catch (error) {
        console.log(error);
        throw error
        
    }

    
})

const autoCompleteSuggestions = asyncHandler(async(req, res) => {
    const {input} = req.query

    if(!input){
        throw new ApiError(404, 'Input not found');
    }

    try {
        const suggestions = await getAutoCompleteSuggestions(input);
    
        if(!suggestions){
            throw new ApiError(404,'Suggestion not found')
        }
    
        return res
            .status(200)
            .json(200, suggestions, 'Suggestion fetched successfully')
    } catch (error) {
        console.log(error);
        throw error
        
    }
});

export {coordinates, distanceTime, autoCompleteSuggestions}