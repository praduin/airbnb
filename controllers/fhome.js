const Home = require("../models/home");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const User = require("../models/signin");
const upload = multer({ dest: "uploads/" }); // ✅ fixed typo: "uplaods" -> "uploads"
const Favorite = require("../models/favorite");
const { check } = require("express-validator");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    isloggedin: req.isloggedin,
    pageTitle: "Add Home to Airbnb",
    currentPage: "addhome",
    editing: false,
  });
};

exports.getHome = (req, res, next) => {
  if (!req.session.isloggedin) {
    console.log("thiis is in sign in page ");
    return res.redirect("/userlogin");
  }

  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes,
      isloggedin: req.session.isloggedin,
      pageTitle: "Homes List",
      currentPage: "home",
    });
  });
};
exports.postEditHome = async (req, res) => {
  const id = req.params.homeId;

  const houseName = req.body.houseName?.trim() || null;
  const facilities = req.body.facilities?.trim() || null;
  const location = req.body.location?.trim() || null;

  const pricePerDay = /^\d+$/.test(req.body.pricePerDay)
    ? parseInt(req.body.pricePerDay)
    : null;
  const numberOfRooms = /^\d+$/.test(req.body.numberOfRooms)
    ? parseInt(req.body.numberOfRooms)
    : null;
  const numberOfNights = /^\d+$/.test(req.body.numberOfNights)
    ? parseInt(req.body.numberOfNights)
    : null;

  const houseImages = req.file ? req.file.filename : req.body.existingImage;

  try {
    const home = await Home.findById(id);

    if (!home) {
      console.error("Home not found for ID:", id);
      return res.redirect("/host/hosthome");
    }

    home.houseName = houseName;
    home.facilities = facilities;
    home.location = location;
    home.pricePerDay = pricePerDay;
    home.numberOfRooms = numberOfRooms;
    home.numberOfNights = numberOfNights;
    home.houseImages = houseImages;

    await home.save();

    console.log("Home updated successfully");
    res.redirect("/host/hosthome");
  } catch (err) {
    console.error("Error updating home:", err);
    res.status(500).send("Failed to update home");
  }
};

exports.getIndex = (req, res, next) => {
  console.log("session value", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes,
      isloggedin: req.session.isloggedin,
      pageTitle: "All Homes",
      currentPage: "home",
    });
  });
};

exports.gethosthome = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("host/hosthome", {
      registeredHomes,
      isloggedin: req.isloggedin,
      pageTitle: "Host Homes",
      currentPage: "hosthome",
    });
  });
};

exports.homepage = (req, res, next) => {
  if (!req.session.isloggedin) {
    console.log("thiis is in sign in page ");
    return res.redirect("/userlogin");
  }

  Home.find()
    .then(([registeredHomes]) => {
      res.render("store/home-list", {
        registeredHomes,
        isloggedin: req.isloggedin,
        pageTitle: "All Homes",
        currentPage: "home",
      });
    })
    .catch((err) => {
      console.error("Error fetching homes:", err);
      res.status(500).send("Database error");
    });
};

exports.getBookings = (req, res, next) => {
  if (!req.session.isloggedin) {
    console.log("thiis is in sign in page ");
    return res.redirect("/userlogin");
  }

  res.render("store/booking", {
    pageTitle: "My Bookings",
    isloggedin: false,
    isloggedin: req.isloggedin,
    currentPage: "bookings",
  });
};
exports.getfavrouited = (req, res, next) => {
  if (!req.session.isloggedin || !req.session.user) {
    return res.redirect("/userlogin");
  }

  const userId = req.session.user._id;

  Favorite.find({ userId })
    .populate("homeId")
    .then((favoriteList) => {
      const favoriteHomes = favoriteList
        .map((fav) => fav.homeId)
        .filter((home) => home !== null);

      res.render("store/favoritehome", {
        favoriteHomes,
        isloggedin: true,
        pageTitle: "My Favorites",
        currentPage: "favourites",
      });
    })
    .catch((err) => {
      console.error("Error fetching favorites:", err);
      res.status(500).send("Something went wrong");
    });
};

exports.getHomeDetail = (req, res, next) => {
  const homeId = req.params.homeId; // match this to the route

  if (!homeId) {
    return res.redirect("/");
  }

  Home.findById(homeId)
    .then((hom) => {
      if (!hom) {
        return res.redirect("/homes");
      }

      res.render("store/home-detail", {
        isloggedin: req.isloggedin,
        home: hom,
        pageTitle: "Home Detail",
        currentPage: "home",
      });
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).send("Something went wrong");
    });
};
exports.postAddToFavorite = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/userlogin");
  }

  const userId = req.session.user._id;
  const homeId = req.body.id;

  Favorite.findOne({ homeId, userId })
    .then((existingFavorite) => {
      if (existingFavorite) {
        console.log("Home already in favorites for this user");
        return res.redirect("/favoritehome");
      }

      const fav = new Favorite({ homeId, userId });
      return fav.save();
    })
    .then((result) => {
      if (result) {
        return res.redirect("/favoritehome");
      }
    })
    .catch((err) => {
      console.error("Error adding to favorites:", err);
      res.status(500).send("Failed to add to favorites");
    });
};

exports.postremoveFromFavorite = (req, res, next) => {
  const homeId = req.body.id;

  if (!homeId || !homeId.match(/^[a-f\d]{24}$/i)) {
    console.error("Invalid homeId:", homeId);
    return res.redirect("/favoritehome", {});
  }

  Favorite.findOneAndDelete({ homeId: homeId })
    .then((result) => {
      console.log("Home removed:", result);
      res.redirect("/favoritehome");
    })
    .catch((err) => {
      console.error("Error removing home:", err);
      res.status(500).send("Failed to remove from favorites");
    });
};
exports.deletehomewithid = async (req, res, next) => {
  const homeId = req.params.homeId; // <- FIXED: match this with your route param

  try {
    await Home.findByIdAndDelete(homeId);
    res.redirect("/host/hosthome");
  } catch (err) {
    console.error("Error in deleting:", err);
    res.status(500).send("Failed to delete home.");
  }
};

exports.getData = (req, res, next) => {
  const houseName = req.body.houseName?.trim() || null;
  const pricePerDay = /^\d+$/.test(req.body.pricePerDay)
    ? parseInt(req.body.pricePerDay)
    : null;
  const facilities = req.body.facilities?.trim() || null;
  const numberOfRooms = /^\d+$/.test(req.body.numberOfRooms)
    ? parseInt(req.body.numberOfRooms)
    : null;
  const location = req.body.location?.trim() || null;
  const numberOfNights = /^\d+$/.test(req.body.numberOfNights)
    ? parseInt(req.body.numberOfNights)
    : null;

  const houseImages = req.file ? req.file.filename : null;

  const home = new Home({
    houseName,
    location,
    numberOfRooms,
    pricePerDay,
    numberOfNights,
    houseImages,
    facilities,
  });

  home
    .save()
    .then(() => res.redirect("/homes"))
    .catch((err) => {
      console.error("Error saving home:", err);
      res.status(500).send("Something went wrong");
    });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId; // ✅ CORRECT param

  if (!homeId) {
    return res.redirect("/host/hosthome");
  }

  console.log("findById called with homeId:", homeId);

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/hosthome");
      }

      res.render("host/edit-home", {
        home,

        pageTitle: "Edit Home",
        currentPage: "hosthome",
        editing: req.query.editing === "true", // ✅ use query param
      });
    })
    .catch((err) => {
      console.error("Error fetching home for edit:", err);
      res.status(500).send("Failed to load home for editing");
    });
};

exports.getLogin = (req, res, next) => {
  console.log("you are locate in userlogin ");
  res.render("auth/userlogin", {
    pageTitle: "User Login",
    errors: [],
    currentPage: "userlogin",
    isloggedin: false,
  });
}; // GET /userlogin

/// POST /logindone
exports.logindones = async (req, res, next) => {
  const { email, username } = req.body;

  try {
    const user = await User.findOne({ email, username });

    if (!user) {
      return res.status(422).render("auth/userlogin", {
        pageTitle: "login",
        currentPage: "login",
        isloggedin: false,
        errors: ["User does not exist"],
        oldInput: { email, username },
      });
    }

    req.session.isloggedin = true;
    req.session.user = user; // ✅ store full user in session

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/userlogin");
      }

      res.redirect("/");
    });
  } catch (err) {
    console.error("Login error:", err);
    res.redirect("/userlogin");
  }
};

// GET /logout
exports.logout = (req, res, next) => {
  req.session.isloggedin = false;

  req.session.save((err) => {
    if (err) console.log("Session save error:", err);

    // ✅ Clear the cookie
    res.cookie("isloggedin", false, {
      httpOnly: true,
      errors: [],
      expires: new Date(0), // clear cookie
    });

    res.redirect("/userlogin");
  });
};

// POST /logout (if you're using POST for logout)
exports.postlogout = (req, res, next) => {
  req.session.destroy(() => {
    res.cookie("isloggedin", false, {
      httpOnly: true,
      expires: new Date(0),
    });

    res.render("host/index", {
      errors: [],
    });
  });
};

exports.usersignin = (req, res, next) => {
  console.log("You are on the login page");
  res.render("auth/usersignin", {
    pageTitle: "User Login",
    isloggedin: false,
    currentPage: "userlogin",
    errors: [],
    oldInput: {
      username: "",
      email: "",
      password: "",
      confirmpassword: "",
      role: "",
      description: "",
    },
  });
};

const { body, validationResult } = require("express-validator");
//const Home = require("../models/home"); // Make sure this model exists
exports.signindone = [
  // Name Validation
  check("username")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name should contain at least 2 letters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must contain only letters and spaces"),

  // Email Validation
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // Password Validation
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  // Confirm Password
  body("confirmpassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // Role Validation
  check("role")
    .isIn(["user", "guest"])
    .withMessage("Role must be either 'user' or 'guest'"),

  // Description Validation
  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  // Final Middleware
  (req, res, next) => {
    const { username, email, password, confirmpassword, role, description } =
      req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/usersignin", {
        pageTitle: "Signup",
        currentPage: "signup",
        isloggedin: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: { username, email, role, description },
      });
    }

    bcrypt.hash(password, 12).then((hashedpassword) => {
      const user = new User({
        username: username,
        email: email,
        password: hashedpassword,
        role: role,
      });

      user
        .save()
        .then(() => {
          req.session.isloggedin = true;
          req.session.save((err) => {
            if (err) {
              console.log("Session save error:", err);
              return res.redirect("/usersignin");
            }

            console.log("Signup successful:", req.body);
            return res.redirect("/");
          });
        })
        .catch((err) => {
          return res.status(422).render("auth/usersignin", {
            pageTitle: "signup",
            currentPage: "signup",
            isloggedIn: false,
            errors: [err.message],
            oldInput: { username, email, role, description },
          });
        });
    });
  },
];
