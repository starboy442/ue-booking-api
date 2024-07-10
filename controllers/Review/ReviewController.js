import ReviewModel from "../../models/review/ReviewModel.js";

class ReviewController {
  static addReview = async (req, res) => {
    const { user_id, review } = req.body;
    if (user_id && review) {
      try {
        const new_review = new ReviewModel({
          user_id: user_id,
          review: review,
        });
        await new_review
          .save()
          .then(() => {
            res.send({
              status: "success",
              message: "Review post successfully!",
            });
          })
          .catch((error) => {
            res.send({ status: "error", message: error.message });
          });
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    } else {
      res.send({ status: "error", message: "Data not found!" });
    }
  };

  static getAllReviews = async (req, res) => {
    try {
      const reviews = await ReviewModel.find({});
      if (reviews.length > 0) {
        res.send({ status: "success", reviews: reviews });
      } else {
        res.send({ status: "error", message: "No reviews found!" });
      }
    } catch (error) {
      res.send({ status: "error", message: error.message });
    }
  };

  static getReviewByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (user_id) {
      try {
        const reviews = await ReviewModel.find({ user_id: user_id });
        if (reviews.length > 0) {
          res.send({ status: "success", reviews: reviews });
        } else {
          res.send({ status: "error", message: "No reviews found!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };

  static deleteReviewById = async (req, res) => {
    const { review_id } = req.params;
    if (review_id) {
      try {
        const review = await ReviewModel.findOneAndDelete({ _id: review_id });
        if (review) {
          res.send({
            status: "success",
            message: "Review deleted successfully",
          });
        } else {
          res.send({ status: "error", message: "No reviews found!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };
}

export default ReviewController;
