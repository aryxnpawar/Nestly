const Review = require('../models/review')
const Listing = require('../models/listing')

module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;

    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    await newReview.save();

    let listing = await Listing.findById(id);
    listing.reviews.push(newReview);

    await listing.save();
    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${id}`);
  }

module.exports.destroyReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  }