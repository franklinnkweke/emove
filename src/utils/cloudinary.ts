import cloudinary from "cloudinary";

const cloudUpload = cloudinary.v2;

cloudUpload.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_KEY_SECRET
})


export default cloudUpload;