import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/APIError.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens=async (userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}


    }catch(error){
        throw new ApiError(500,"Something Went Wrong While generating refresh and access tokens")
    }
}



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
    // console.log(email)

    if(
        [fullname,username,email,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const ExistedUser = await User.findOne({ 
        $or:[ {email} , {username} ]
    })
    if(ExistedUser){
        throw new ApiError(409,"User with or email or username already exists")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }


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
        username:username.toLowerCase(),
        avatarPublicId:avatar.public_id
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken ")

    if(!createdUser){
        throw new ApiError(500,"Something went Wronng while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerd Succesfully")
    )

})

const loginUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user is already exist:username
    //if exist check the password user inputed is same as in the database
    //password same -> access token and refresh token
    //send cookies

    const {username,email,password}=req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if(!isPasswordvalid){
        throw new ApiError(401,"Invalid User Credentials")
    }

    const {accessToken , refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "User Logged in succesfully"
    )
    )
  
})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))

})
const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
    
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
        )
        
        const user= await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,{"AccessToken":accessToken,"RefreshToken":newrefreshToken},"AccessToken refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invalid Refresh Token")
    }

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body

    const user= await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Password")
    }

    user.password=newpassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    )

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetched Successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email,}=req.body
    
    if(!fullname || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
        
            $set:{
                fullname:fullname,
                email:email
            }
        
        },
        {new:true}
    ).select("-password")


    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated"))

})


const updateUserAvatar=asyncHandler(async(req,res)=>{

    const avatarLocalPath=req.file?.path
    const currentUser=await User.findById(req.user?._id)
    console.log(currentUser)
    const oldAvatarId=currentUser?.avatarPublicId
    console.log(oldAvatarId)
    

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar || !avatar.url){
        throw new ApiError(400,"Error While Uploading on Cloudinary")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url,
            avatarPublicId:avatar.public_id
        }
    },{new:true}).select("-password")

    if(!oldAvatarId){
        throw new ApiError(500,"File Not on CLoudinary")
    }
    await deleteFromCloudinary(oldAvatarId)


    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Avatar Updated"))

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage File is Missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage ||!coverImage.url){
        throw new ApiError(400,"Error while  uploading on Cloudinary")
    }

    await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{
        new:true
    })
    const user=await User.findById(req.user?._id).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image Updated successfully "))

})


export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage}