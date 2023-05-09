// import {doesUserExist} from "./userService"

// interface DriverDataType {
//   _id?: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   password?: string;
//   dateOfBirth?: string;
//   gender?: string;
//   isVerified?: boolean;
//   routeOfOperation?: [];
//   phoneNumber?: string;
//   accountNumber?: string;
//   validID?: string;
//   photo?: string;
// }

// export const doesDriverExist = (email: string) => {
//     return doesUserExist(email)
// };
// //writing driver to database

// export const writeDriverToDatabase = async (driver: {}) => {
//   try {
//     const newDriver = new Driver(driver);
//     await newDriver.save();
//     return newDriver;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

// //update driver record

// export const updateDriverRecordWithEmail = async (
//   email: string,
//   driverData: DriverDataType
// ) => {
//   try {
//     const driver = (await doesDriverExist(email)) as DriverDataType;
//     const updatedDriver = await Driver.findByIdAndUpdate(
//       driver._id,
//       driverData,
//       {
//         new: true,
//       }
//     );
//     return updatedDriver;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

import Driver from "../models/driverModel";

interface photoData{
    public_id: String,
    url: String
}

interface DriverDataType {
  _id?: string;
  fullName?: string;
  routeOfOperation?: string;
  phoneNumber?: string;
  accountNumber?: string;
  validID?: photoData;
  photo?: photoData;
}

export const doesDriverExist = (data: { fullName?: string; phoneNumber?: string }) => {
    if (data.fullName && data.phoneNumber) {
      return new Promise((resolve) => {
        const driver = Driver.findOne({ fullName: data.fullName, phoneNumber: data.phoneNumber }) as DriverDataType;
        resolve(driver);
      });
    }
    return null;
  };

export const editDriver = (id:string, data: any) => {
    try{
        const driver = Driver.findById(id) as DriverDataType;
      if(!driver){
          return false;
      }
      if (data) {
        return new Promise((resolve) => {
          const driver = Driver.findByIdAndUpdate(id, data) as DriverDataType;
          resolve(driver);
        });
      }
      return null;
    }catch(err){
      return err;
    }
  };

export const deleteDriver = (id:string) => {
    try{
      if(!id){
        return false;
    }
    
    return new Promise((resolve) => {
    const driver = Driver.findByIdAndDelete(id);
    resolve(driver);
    });

    return null;
    }catch(err){
      return err;
    }
  };

  export const writeDriverToDatabase = async (driver: {}) => {
    const newDriver = new Driver(driver);
    return newDriver
      .save()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log("Error: ", err);
        return false;
      });
  };

  export const getAllDrivers = async () => {
    try {
      const drivers = await Driver.find();
      return drivers;
    } catch (error) {
      console.log("Error: ",error);
      return false;
    }
  };

  export const countDrivers = async () => {
    try {
      const drivers = await Driver.find().count();
      return drivers;
    } catch (error) {
      console.log("Error: ",error);
      return false;
    }
  };