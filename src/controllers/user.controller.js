import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/APIError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser=asyncHandler(async (req,res )=>{
    //get user details from frontend
    //validation - not empty
    //check if user is already exist:username and email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refereshtoken field from response
    //check for user creation
    //return response

    const {fullname,username,email,password}=req.body
    console.log(email)

    if(
        [fullname,username,email,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const ExistedUser = User.findOne({ 
        $or:[ {email} , {username} ]
    })
    if(ExistedUser){
        throw new ApiError(409,"User with or email or username already exists")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(409, "User with or email or username already exists")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken ")

    if(!createdUser){
        throw new ApiError(500,"Something went Wronng while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerd Succesfully")
    )

})

export {registerUser,}