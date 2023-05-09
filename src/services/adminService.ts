import { doesUserExist } from "./userService";
import User from "../models/userModel";

interface UserDataType {
 _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  roles?: string[];
  driverStatus?: string;
  isVerified?: boolean;
  routeOfOperation?: [];
  phoneNumber?: string;
  accountNumber?: string;
  validID?: string;
  photo?: string;
}



export const verify = async (id: string) => {
    // return new Promise((resolve, reject) => {
    //     const user = doesUserExist({ id }) as UserDataType
    //     if (!user) {
    //         reject("Invalid user")
    //     }
    //     const updatedUser = User.findByIdAndUpdate(id, { driverStatus: 'verified',  $push: { roles: "driver" }  }, {new: true})
    //     resolve(updatedUser)
        
    // })
    const user = await doesUserExist({ id }) as UserDataType
    if (!user) {
        throw new Error("User does not exist")
    }
    if (user.roles?.includes('driver')) {
        throw new Error("Already a driver")
    } 
    const updatedUser = User.findByIdAndUpdate(id, { driverStatus: 'verified',  $push: { roles: "driver" }  }, {new: true})
    return updatedUser 
};

export const reject = async(id: string) => {
    const user = doesUserExist({ id })
    if (!user) {
        throw new Error("User does not exist")
    }
    const updatedUser = await User.findByIdAndUpdate(id, { driverStatus: 'rejected' }, {new: true})
    return updatedUser
};

export const getAllUsers = async() => {
   const users = await User.find()
   return users
}

export const getPendingUsers = async() => {
    const pendingUsers = await User.find({ driverStatus: 'pending' })
    if (!pendingUsers) {
        throw new Error("No pending users")
    }
    return pendingUsers
}