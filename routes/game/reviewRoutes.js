import express from "express";
import ReviewController from "../../controllers/Review/ReviewController.js";
const review = express.Router();

review.get("/review", ReviewController.getAllReviews);
review.get("/review/:user_id", ReviewController.getReviewByUserId);
review.delete("/review/:review_id", ReviewController.deleteReviewById);
review.post("/review/add", ReviewController.addReview);

export default review;
