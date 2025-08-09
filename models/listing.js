const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url:String,
    filename:String
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: {
    type: String,
    enum: ['mountains', 'pool', 'beach','arctic','iconic city','cabins'], 
    required: true
  }
});

listingSchema.post("findOneAndDelete", async (doc) => {
  if (doc.reviews.length > 0) {
    for (const review of doc.reviews) {
      await Review.findByIdAndDelete(review);

      // this works too, just a bit hard to understand
      // await Review.deleteMany({_id:{$in:doc.reviews}})
    }
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
