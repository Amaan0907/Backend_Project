import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "./APIError.js"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
})

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null
    //upload the file on cloudinary
    const uploadresult = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    })
    //file has been uploaded successfully
    // console.log("File is Uploaded",uploadresult.url)
    fs.unlinkSync(localfilepath)
    console.log(uploadresult)
    return uploadresult
  } catch (error) {
    fs.unlinkSync(localfilepath) //remove the locally saved temp file as the upload operation operation got failed
    return null
  }
}

const deleteFromCloudinary = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "No Avatar to Delete")
    }

    const response = await cloudinary.uploader.destroy(id)

    if (response.result !== "ok") {
      throw new ApiError(500, "Failed to delete old file")
    }

    return response
  } catch (error) {
    if (error instanceof ApiError) throw error

    throw new ApiError(500, "Something Went Wrong")
  }
}

export { uploadOnCloudinary, deleteFromCloudinary }
