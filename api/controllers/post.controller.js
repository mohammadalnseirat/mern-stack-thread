import cloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { handleError } from "../utils/error.js";

//! 1-Function To create a new Post:
export const createPost = async (req, res, next) => {
  try {
    const { postedBy, text } = req.body;
    let { image } = req.body;
    if (!postedBy || !text) {
      return next(handleError(401, "All fields are required"));
    }
    // ?Find the user based on the postedBy
    const user = await User.findById(postedBy);
    if (!user) {
      return next(handleError(404, "User not found"));
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return next(
        handleError(401, "Unauthorized- Your are not allowed to create a post")
      );
    }
    // ?check the maxLength:
    const maxLength = 500;
    if (text.length > maxLength) {
      return next(
        handleError(
          401,
          `Text is too long,should be less than ${maxLength} characters`
        )
      );
    }
    // !check the image:
    if (image) {
      const uploadedResponseImage = await cloudinary.uploader.upload(image);
      image = uploadedResponseImage.secure_url;
    }
    //? Create a new Post:
    const newPost = new Post({
      postedBy,
      text,
      image,
    });
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    console.log("Error creating post", error.message);
    next(error);
  }
};

//! 2-Function To get post:
export const getPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(handleError(404, "Post not found"));
    }
    // send the response back:
    res.status(200).json(post);
  } catch (error) {
    console.log("Error getting post", error.message);
    next(error);
  }
};

// ! 3-Function To delete post:
export const deletePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(handleError(404, "Post not found"));
    }
    //* check the owner of the post(allowed to delete post):
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return next(
        handleError(
          401,
          "Unauthorized- You are not allowed to delete this post"
        )
      );
    }
    //! Delete the image from cloudinary:
    if (post.image) {
      const puplicImageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(puplicImageId);
    }
    // ?Delete the post:
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error deleting post", error.message);
    next(error);
  }
};

// ! 4-Function To like or unlike post:
export const likeUnlike_Post = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(handleError(404, "Post not found"));
    }
    //* check if the user has already liked or unliked the post:
    const isLikedPost = post.likes.includes(userId.toString());
    if (isLikedPost) {
      //? unlike the post:
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "User unliked Post successfully" });
    } else {
      //? like the post:
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await post.save();
      res.status(200).json({ message: "User liked Post successfully" });
    }
  } catch (error) {
    console.log("Error liking or unliking post", error.message);
    next(error);
  }
};
