const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find().populate("image");
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: "author" })
    .populate("owner")
    .populate("image");
  if (!listing) {
    req.flash("error", "No such Listing!");
    res.redirect("/listings");
  } else {
    res.render("./listings/show.ejs", { listing });
  }
};

module.exports.createListing = async (req, res) => {
  const { path, filename } = req.file;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url: path, filename: filename };

  const address = req.body.listing.location + ", " + req.body.listing.country;

  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json`,
    {
      headers: {
        "User-Agent": "Nestly/1.0 (miscellxneous00@gmail.com.com)",
      },
    }
  );
  let data = await response.json();

  if (data.length > 0) {
    const place = data[0];
    console.log(`Latitude: ${place.lat}, Longitude: ${place.lon}`);
  } else {
    console.log("No results found");
  }

  const place = data[0];

  newListing.geometry = {
    type: 'Point',
    coordinates: [parseFloat(place.lon), parseFloat(place.lat)]
  };

  await newListing.save();

  console.log(newListing);
  req.flash("success", "Added new Listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  let orignalUrl = listing.image.url;
  let newUrl = orignalUrl.replace("/upload", "/upload/h_250"); //Image transformation
  if (!listing) {
    req.flash("error", "No such Listing!");
    res.redirect("/listings");
  } else {
    res.render("./listings/edit.ejs", { listing, newUrl });
  }
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
  });

  if (req.file) {
    const { path, filename } = req.file;
    listing.image = { url: path, filename: filename };
    await listing.save();
  }

  req.flash("success", "Edit Listing Successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Deleted Listing successfully!");
  res.redirect("/listings");
};
