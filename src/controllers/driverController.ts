import { doesDriverExist, writeDriverToDatabase, getAllDrivers, editDriver, deleteDriver, countDrivers } from "../services/driverService";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, SALT, EMAIL, PASSWORD, VERIFYURL, RESETURL } from "../env";
import cloudUpload from "../utils/cloudinary";

const secret = JWT_SECRET;

interface DriverDataType {
    _id?: string;
    fullName?: string;
    routeOfOperation?: string;
    phoneNumber?: string;
    accountNumber?: string;
    validID?: string;
    photo?: string;
  }


export async function addDriver(req: Request, res: Response) {
    const { fullName, routeOfOperation, phoneNumber, accountNumber, validId, photo }:any = req.body;
    let cloudImagePhoto: any;
    let cloudImageValidID: any;
    //const photo = req.file?.path;

    console.log('request body: ', req.body);
  
    if(!fullName || !routeOfOperation || !phoneNumber || !accountNumber || !validId || !photo){
      return res.status(400).json({ message: "Bad Request" });
    }
  
    console.log("req body: ",req.body);
    const rawToken  = req.headers.authorization as string;
    const token = rawToken.split(" ")[1];
    console.log("token: ", token);
    const verifyToken = jwt.verify(`${token}`, `${secret}`) as Record<string, any>;
    console.log("verifyToken: ", verifyToken);
  
    if (!verifyToken) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const driverImage = {
        fullName,
        phoneNumber
    }
    const driver = (await doesDriverExist(driverImage)) as DriverDataType;
    if (driver) {
      return res.status(400).json({ message: "Driver already exists" });
    }
    // cloudImagePhoto = await cloudUpload.uploader.upload(photo!, {
    //   folder: "emove/photos",
    // });
  
    // cloudImageValidID = await cloudUpload.uploader.upload(validId, {
    //   folder: "emove/validID",
    // });
  
    const driverUserInfo = {
      fullName,
      routeOfOperation,
      phoneNumber,
      accountNumber,
      driverStatus: "pending",
      photo,
      validId
    };
  
    //write driver to db
    const newDriver = await writeDriverToDatabase(driverUserInfo);
  
    if (!newDriver) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({ message: "Driver added", newDriver });
  }
  

  export async function sendAllDrivers(req: Request, res: Response){
    const rawToken = req.headers.authorization;
    const token = rawToken?.split(' ')[1] as string;
    console.log("token: ", token);
    if(!token){
        return res.status(400).json({ message: "Bad Request"});
    }

    const adminDetails = await jwt.verify(`${token}`, `${secret}`);
    console.log("adminDetails: ", adminDetails)
    if(!adminDetails){
        return res.status(400).json({ message: "Bad Request"})
    }
    const drivers = await getAllDrivers();
    return res.status(200).json({
        message: "Successful",
        drivers
    })
  }

  export async function editDriverDetails(req: Request, res: Response){
    console.log("editDriverDetails")
    const rawToken = req.headers.authorization as string;
    const token = rawToken?.split(' ')[1] as string;
    const id = req.params.id;
    const data = req.body as DriverDataType;
    console.log("token: ", token);
    console.log("req body: ", data);
    if(!token || !id){
        return res.status(400).json({ message: "Bad Request"});
    }

    const adminDetails = await jwt.verify(`${token}`, `${secret}`);
    console.log("adminDetails: ", adminDetails)
    if(!adminDetails){
        return res.status(400).json({ message: "Bad Request"})
    }
    const driver = await editDriver(id, data);
    if(!driver){
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
    return res.status(200).json({
        message: "Successful",
        driver
    })
  }

  export async function deleteDriverDetails(req: Request, res: Response){
    const rawToken = req.headers.authorization as string;
    const token = rawToken?.split(' ')[1] as string;
    const id = req.params.id;
    console.log("token: ", token);
    if(!token || !id){
        return res.status(400).json({ message: "Bad Request"});
    }

    const adminDetails = await jwt.verify(`${token}`, `${secret}`);
    console.log("adminDetails: ", adminDetails)
    if(!adminDetails){
        return res.status(400).json({ message: "Bad Request"})
    }
    const driver = await deleteDriver(id);
    if(!driver){
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
    return res.status(200).json({
        message: "Successful"
    })
  }


  export async function countDriverDetails(req: Request, res: Response){
    const rawToken = req.headers.authorization as string;
    const token = rawToken?.split(' ')[1] as string;
    console.log("token: ", token);

    if(!token){
        return res.status(400).json({ message: "Bad Request"});
    }
    const countOfDrivers = await countDrivers();

    if(!countOfDrivers){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
    return res.status(200).json({ message: "Successful", countOfDrivers})

  }

//   export async function editDriver(req: Request, res: Response) {
//   const { id } = req.params;
//   const { routeOfOperation, accountNumber, photo, validID } = req.body;
//   let cloudImagePhoto: any;
//   let cloudImageValidID: any;

//   const user = (await doesDriverExist({ fullName, phoneNumber })) as DriverDataType;

//   if (!user) {
//     return res.status(400).json({ message: "User not found" });
//   }

//   if (!user.roles?.includes("driver")) {
//     return res.status(400).json({ message: "Not a" });
//   }

//   if (photo) {
//     cloudImagePhoto = await cloudUpload.uploader.upload(photo!, {
//       folder: "emove/photos",
//     });
//   }

//   if (validID) {
//     cloudImageValidID = await cloudUpload.uploader.upload(validID, {
//       folder: "emove/validID",
//     });
//   }

//   const updatedUserInfo = {
//     _id: user._id,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     email: user.email,
//     password: user.password,
//     dateOfBirth: user.dateOfBirth,
//     gender: user.gender,
//     isVerified: user.isVerified,
//     phoneNumber: user.phoneNumber,
//     accountNumber: !accountNumber ? user.accountNumber : accountNumber,
//     driverStatus: user.driverStatus,
//     photo: !photo
//       ? user.photo
//       : {
//           public_id: cloudImagePhoto!.public_id,
//           url: cloudImagePhoto.secure_url,
//         },
//     validID: !validID
//       ? user.validID
//       : {
//           public_id: cloudImageValidID.public_id,
//           url: cloudImageValidID.secure_url,
//         },
//   };

//   const updateUser = updateUserRecordWithEmail(user.email!, updatedUserInfo);

//   if (!updateUser) {
//     //please retry
//     return res.status(500).json({ message: "Please try again" });
//   }
//   return res
//     .status(200)
//     .json({ message: "Update successful", data: updateUser });
// }



// export const deleteDriverController = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const user = await deleteDriver(id);
//     console.log(user);
//     if (!user) {
//       return res.status(400).json({ message: "No user found" });
//     }
//     return res.status(200).json({ user });
//   };
  
//   export const getOneDriverController = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const driver = await findDriver(id);
  
//     if (!driver) {
//       return res.status(400).json({ message: "No driver found" });
//     }
//     return res.status(200).json({ driver });
//   };
  
//   export const getAllDriversController = async (req: Request, res: Response) => {
//     const users = await getAllUsers();
//     if (!users) {
//       return res.status(400).json({ message: "No user found" });
//     }
//     const drivers = users.filter((user) => user.roles.includes("driver"));
//     if (!drivers) {
//       return res.status(400).json({ message: "No driver found" });
//     }
//     return res.status(200).json({ drivers });
//   };
  