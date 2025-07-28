const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Import your routers
const hostRouter = require("./routes/hostrouter");
const userRouter = require("./routes/userrouter");

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ serve uploaded images

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use host routes
app.use(userRouter);
app.use("/host", hostRouter);

// Home page or fallback
app.get("/", (req, res) => {
  res.send("Welcome to Airbnb Clone");
});

// Start server
const PORT = 3000;
const dbpath =
  "mongodb+srv://praduin:root@completeairbnb.ki07pmq.mongodb.net/airbnb?retryWrites=true&w=majority&appName=completeairbnb";
mongoose
  .connect(dbpath)
  .then(() => {
    console.log("Connected to MongoDB using Mongoose");
    console.log("connect to MongoDB");
    app.listen(PORT, () => {
      console.log("Server running on http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB using Mongoose", err);
  });
