import User from "../models/userModel";

interface UserDataType {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified?: boolean;
  roles?: [string];
  wallet_balance?: number;
}

export const doesUserExist = (data: { email?: string; id?: string }) => {
  if (data.email) {
    return new Promise((resolve) => {
      const user = User.findOne({ email: data.email }) as UserDataType;
      resolve(user);
    });
  } else if (data.id) {
    console.log("dataID: ", data.id)
    return new Promise((resolve) => {
      const user = User.findById(data.id) as UserDataType;
      resolve(user);
    });
  }
};

//pass object to this function to find user
export const findAnyUser = async (data: UserDataType) => {
  return User.findOne(data)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};
//writing user to database

export const writeUserToDatabase = async (user: {}) => {
  const newUser = new User(user);
  return newUser
    .save()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};

//update user record

export const updateUserRecordWithEmail = async (
  email: string,
  userData: UserDataType
) => {
  try {
    const user = (await doesUserExist({ email })) as UserDataType;
    const updatedUser = await User.findByIdAndUpdate(user._id, userData, {
      new: true,
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getAllUsersCount = async () => {
  try {
    const usersCount = await User.find().count();
    return usersCount;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const findDriver = async (id: string) => {
  const driver = await User.find({ _id: id, roles: "driver" });
  if (!driver) {
    throw new Error("Driver not found");
  }
  return driver;
};

export const deleteDriver = async (id: string) => {
  console.log(id);
  const user = await User.findByIdAndUpdate(
    id,
    { driverStatus: "not started", $pop: { roles: 1 } },
    { new: true }
  );
  if (!user) {
    throw new Error("Driver not found");
  }

  return user;
};
