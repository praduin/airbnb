const express = require("express");
const path = require("path");
const { mongoConnect } = require("./utils/databaseutil");
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
console.log("passed");
mongoConnect(() => {
  console.log("connect to MongoDB");
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
});
