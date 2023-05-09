import { ObjectId } from "mongodb";
import Trip from "../models/tripModel";

export const getAllTripsForAdmin = async () => {
  //return all trips on the app
  return Trip.aggregate([
    {
      $lookup: {
        from: "routes",
        localField: "routeId",
        foreignField: "_id",
        as: "route",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "passenger",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driverId",
        foreignField: "_id",
        as: "driver",
      },
    },
  ])
    .then((collection) => {
      return collection;
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};

export const getAllTripsForPassenger = async (passengerID: string) => {
  //return all trips for a passenger on the app
  return Trip.aggregate([
    {
      $match: {
        userId: new ObjectId(`${passengerID}`),
      },
    },
    {
      $lookup: {
        from: "routes",
        localField: "routeId",
        foreignField: "_id",
        as: "route",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "passenger",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driverId",
        foreignField: "_id",
        as: "driver",
      },
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ])
    .then((collection) => {
      return collection;
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};
