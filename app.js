if(process.env.NODE_ENV!="production")
  require('dotenv').config()

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const User = require('./models/user.js');
const passport = require('passport')
const LocalStrategy = require('passport-local')

const listingRouter = require("./routes/listing.js");  
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js')

const port = 8080;

const app = express();
const dbUrl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SECRET
  }
})

store.on('error', function(error) {
  console.error('Session store error:', error);
});

const sessionOptions = {
  store:store,
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
  .then((res) => {
    console.log("Database Connected");
  })
  .catch((err) => console.log("Error occured : ", err));

async function main() {
  // await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbUrl);
}

app.listen(port, () => {
  console.log("listening on port :", port);
});

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.use((req,res,next)=>{
  res.locals.success=req.flash('success')
  res.locals.error=req.flash('error')
  res.locals.currentUser = req.user
  res.locals.headScripts = res.locals.headScripts || '';
  res.locals.pageScripts = res.locals.pageScripts || '';
  next()
})


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something Went Wrong!" } = err;
  res.status(status).render("error.ejs", { err, status });
});
