import { handleError } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/generateTokenAndSetCookie.js";

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
  } catch (error) {
    console.log("Error while logging out user", error.message);
    next(error);
  }
};
