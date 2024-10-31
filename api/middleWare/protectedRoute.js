import User from "../models/user.model.js";
import { handleError } from "../utils/error.js";
import jwt from "jsonwebtoken";
const protectedRoute = async (req, res, next) => {
  try {
    // Implement your route protection logic here
    const token = req.cookies.jwt_token;
    if (!token) {
      return next(handleError(401, "UN-Authorized Not token provided"));
    }
    // Verify token using your preferred JWT library:
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return next(handleError(401, "UN-AuthorizedInvalid token"));
    }
    // ?get the user grom the token:
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(handleError(404, "UN-Authorized User not found"));
    }
    // Add the current user to the request object:
    req.user = currentUser;
    next();
  } catch (error) {
    console.log("Error while verifying token", error.message);
    next(error);
  }
};

export default protectedRoute;
