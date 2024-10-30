import { handleError } from "../utils/error.js";
import User from "../models/user.model.js";

//! 1-Function To Sign up User:
export const signUpUser = async (req, res, next) => {
  try {
  } catch (error) {
    console.log("Error while signing up user", error.message);
    next(error);
  }
};

//! 2-Function To Sign In User:
export const signInUser = async (req, res, next) => {
  try {
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
