import { handleError } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/generateTokenAndSetCookie.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

//! 1-Function To Sign up User:
export const signUpUser = async (req, res, next) => {
  try {
    //* get the data from rhe body:
    const { name, username, email, password } = req.body;
    if (
      !name ||
      !username ||
      !email ||
      !password ||
      name === "" ||
      username === "" ||
      email === "" ||
      password === ""
    ) {
      return next(handleError(400, "All fields are required"));
    }
    // *Check The Email:
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(handleError(400, "Invalid email"));
    }
    // ? check if the user already exists:
    const existsUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existsUser) {
      return next(handleError(400, "User already exists"));
    }
    // !Check if the password is strong:
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return next(
        handleError(
          400,
          "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters"
        )
      );
    }
    // *hash the password:
    const hashedPassword = bcryptjs.hashSync(password, 10);
    // *create the newUser:
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // *save the newUser:(and generate the token)
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      // ?Remove the password from the respones:
      const { password, ...rest } = newUser._doc;
      res.status(201).json(rest);
    } else {
      return next(handleError(400, "Invalid User Data!"));
    }
  } catch (error) {
    console.log("Error while signing up user", error.message);
    next(error);
  }
};

//! 2-Function To Sign In User:
export const signInUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || username === "" || password === "") {
      return next(handleError(400, "All fields are required"));
    }
    const user = await User.findOne({ username });
    if (!user) {
      return next(handleError(404, "Invalid Username or Password"));
    }
    const isMatchPassword = bcryptjs.compareSync(
      password,
      user?.password || ""
    );
    if (!isMatchPassword) {
      return next(handleError(401, "Invalid Username or Password"));
    }
    // ?genterate the token:
    generateTokenAndSetCookie(user._id, res);
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    console.log("Error while signing in user", error.message);
    next(error);
  }
};

//! 3-Function To Sign Out User:
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("jwt_token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error while logging out user", error.message);
    next(error);
  }
};

//! 4-Function To Follow UnFollow User:
export const followUnFollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // ?Find The User To Be Followed:
    const userToFollow = await User.findById(id);
    // !Find The Current User:
    const currentUser = await User.findById(req.user._id);
    if (id.toString() === req.user._id.toString()) {
      return next(handleError(400, "You can't follow yourself"));
    }
    if (!userToFollow || !currentUser) {
      return next(handleError(400, "User not found"));
    }
    //?Check if the userToFollow is already followed by cureent user:
    const isFollwed = currentUser.following.includes(id);
    if (isFollwed) {
      // *If Yes, unFollow the user:
      // ! Modify currentUser Following Array , Modify userToFollow Followers Array:
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // updtate the followers array to userToFollow.
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // update the following array to the currentUser
      res.status(200).json({ message: "User UnFollowed Successfully" });
    } else {
      // *If No, follow the user:
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // update the followimg array to the currentUser.
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); // update the followers array to userToFollow.
      res.status(200).json({ message: "User Followed Successfully" });
    }
  } catch (error) {
    console.log("Error while following or unfollowing user", error.message);
    next(error);
  }
};

// ! 5-Function To Update User Profile:
export const updateProfilePut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, username, bio, password } = req.body;
    let { profilPicture } = req.body;
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return next(handleError(404, "User not found"));
    }
    if (id.toString() !== userId.toString()) {
      return next(handleError(401, "Unauthorized to update this user"));
    }
    //update the password
    if (password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      if (!passwordRegex.test(password)) {
        return next(
          handleError(
            400,
            "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters"
          )
        );
      }
      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync(password, salt);
      user.password = hashedPassword;
    }
    // update profile picture:
    if (profilPicture) {
      if (user.profilePicture) {
        //?remove the old picture:
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      // ?upload the new picture:
      const uploadedReponsePicture = await cloudinary.uploader.upload(
        profilPicture
      );
      profilPicture = uploadedReponsePicture.secure_url;
    }
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profilePicture = profilPicture || user.profilePicture;

    // *save the user:
    user = await user.save();
    // TODO: Update All replies Inside Posts:

    //!password should be null in response:
    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log("Error while updating user profile", error.message);
    next(error);
  }
};

// ! 6-Function To Get User Profile:
export const getUserProfile = async (req, res, next) => {
  try {
    //! We will fetch user profile either with username or userId
    //! query is either username or userId
    const { query } = req.params; //* query is either username or userId
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      // ?query is userId
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // ?query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }
    if (!user) {
      return next(handleError(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error while getting user profile", error.message);
    next(error);
  }
};
