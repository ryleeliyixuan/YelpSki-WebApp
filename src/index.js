const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
const serviceAccount = require("../config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const userFeed = require("./app/user-feed");
const UserService = require("./app/user-service"); // TODO 10: USERSERVICE
const ResortService = require("./app/resort-service");

const authMiddleware = require("./app/auth-middleware");
const { nextTick } = require("process");

// TODO 4: Add Boilerplate
const ejsMate = require("ejs-mate");
const { sign } = require("crypto");
app.engine("ejs", ejsMate);
// TODO 4: Add Boilerplate

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// TODO 1: Set up log out + get idToken for each request
app.use((req, res, next) => {
  res.locals.user = req.cookies.session;
  next();
});

// use res.render to load up an ejs view file index page
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();
  const username = req.body.username; // get username
  const signInType = req.body.signInType;

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);

        admin
          .auth()
          .verifySessionCookie(sessionCookie, true)
          .then((userData) => {
            // TODO 10: Take user data and save it to firebase
            console.log("Logged in:", userData.email);
            const id = userData.sub;
            const email = userData.email;
            res.cookie("userId", id);

            if (signInType === "register") {
              // save it to firebase
              UserService.createUser(id, email, username).then(() => {
                res.end(
                  JSON.stringify({ status: "success - saved to firebase!" })
                );
              });
            } else {
              res.end(JSON.stringify({ status: "success" }));
            }
          });
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});

// TODO 1: Set up log out + get idToken for each request
app.get("/log-out", function (req, res) {
  res.redirect("/sessionLogout");
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("userId");
  res.redirect("/sign-in");
});

app.get("/resorts", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/resorts/new", { user: req.user, feed });
});

app.post("/resorts", authMiddleware, async (req, res) => {
  const userId = req.cookies.userId;
  const title = req.body.title;
  const location = req.body.location;
  const price = req.body.price;
  const description = req.body.description;

  ResortService.createResort(userId, title, location, price, description).then(
    () => {
      res.end(JSON.stringify({ status: "success - saved to firebase!" }));
      // res.redirect("/dashboard");
    }
  );
});

exports.app = functions.https.onRequest(app);
// app.listen(port);
// console.log("Server started at http://localhost:" + port);
