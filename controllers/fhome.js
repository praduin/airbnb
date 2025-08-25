const Home = require("../models/home");
const bcrypt = require("bcryptjs");
const User = require("../models/signin");

const { check } = require("express-validator");

exports.getAddHome = (req, res, next) => {
  console.log("this is in getaddhomecontrollers");
  res.render("host/edit-home", {
    isloggedin: req.session.isloggedin,
    userRole: req.session.role,
    pageTitle: "Add Home to Airbnb",
    currentPage: "addhome",
    editing: false,
  });
};

exports.getHome = (req, res, next) => {
  if (!req.session.isloggedin) {
    return res.redirect("/userlogin");
  }

  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes,
      isloggedin: req.session.isloggedin,
      userRole: req.session.role,
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

  const houseImages = req.file ? req.file.path : req.body.existingImage;

  try {
    const home = await Home.findById(id);

    if (!home) {
      return res.redirect("/host/hosthome");
    }

    // Check if the current user is the creator of the home

    // Now it's safe to update
    home.houseName = houseName;
    home.facilities = facilities;
    home.location = location;
    home.pricePerDay = pricePerDay;
    home.numberOfRooms = numberOfRooms;
    home.numberOfNights = numberOfNights;
    home.houseImages = houseImages;

    await home.save();

    res.redirect("/host/hosthome");
  } catch (err) {
    res.status(500).send("Failed to update home");
  }
};

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes,
      userRole: req.session.role,
      isloggedin: req.session.isloggedin,
      pageTitle: "All Homes",
      currentPage: "home",
    });
  });
};

exports.gethosthome = (req, res, next) => {
  if (!req.session.isloggedin || !req.session.user) {
    return res.redirect("/userlogin");
  }
  const isSuperHost =
    req.session.user.email &&
    req.session.user.email.toLowerCase() === "pardiumsharma2590@gmail.com";
  const query = isSuperHost ? {} : { createdBy: req.session.user._id };
  Home.find(query).then((registeredHomes) => {
    res.render("host/hosthome", {
      registeredHomes,
      userRole: req.session.role,
      isloggedin: req.session.isloggedin,
      user: req.session.user,
      pageTitle: "Host Homes",
      currentPage: "hosthome",
    });
  });
};

exports.homepage = (req, res, next) => {
  if (!req.session.isloggedin) {
    return res.redirect("/userlogin");
  }

  Home.find()
    .then(([registeredHomes]) => {
      res.render("store/home-list", {
        registeredHomes,
        isloggedin: req.session.isloggedin,
        userRole: req.session.role,
        pageTitle: "All Homes",
        currentPage: "home",
      });
    })
    .catch((err) => {
      res.status(500).send("Database error");
    });
};

exports.getBookings = (req, res, next) => {
  if (!req.session.isloggedin) {
    return res.redirect("/userlogin");
  }

  res.render("store/booking", {
    pageTitle: "My Bookings",
    isloggedin: req.session.isloggedin,
    userRole: req.session.role,
    currentPage: "bookings",
  });
};

exports.getfavrouited = async (req, res, next) => {
  if (!req.session.isloggedin || !req.session.user) {
    return res.redirect("/userlogin");
  }

  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favorites");

    res.render("store/favoritehome", {
      favoriteHomes: user.favorites,
      isloggedin: req.session.isloggedin,
      userRole: req.session.role || null,
      pageTitle: "My Favorites",
      currentPage: "favourites",
    });
  } catch (err) {
    res.redirect("/");
  }
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
        isloggedin: req.session.isloggedin,
        userRole: req.session.role,
        home: hom,
        pageTitle: "Home Detail",
        currentPage: "home",
      });
    })
    .catch((err) => {
      res.status(500).send("Something went wrong");
    });
};

// make sure it's imported

exports.postAddToFavorite = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/userlogin");
  }

  const userId = req.session.user._id;
  const homeId = req.body.id;

  try {
    const user = await User.findById(userId);

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    // Avoid adding duplicate favorites
    if (!user.favorites.includes(homeId)) {
      user.favorites.push(homeId);
      await user.save();
    }

    res.redirect("/favoritehome");
  } catch (err) {
    res.status(500).send("Failed to add to favorites");
  }
};

exports.postremoveFromFavorite = (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user?._id;

  if (!userId || !homeId || !homeId.match(/^[a-f\d]{24}$/i)) {
    return res.redirect("/favoritehome");
  }

  User.findById(userId)
    .then((user) => {
      if (!user || !user.favorites) {
        return res.redirect("/favoritehome");
      }
      // Remove the homeId from favorites array
      user.favorites = user.favorites.filter(
        (favId) => favId.toString() !== homeId
      );
      return user.save();
    })
    .then(() => {
      res.redirect("/favoritehome");
    })
    .catch((err) => {
      res.status(500).send("Failed to remove from favorites");
    });
};
exports.deletehomewithid = async (req, res, next) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).send("Home not found.");
    }
    // Check if user is creator or admin
    const isAdmin =
      req.session.user &&
      req.session.user.email &&
      req.session.user.email.toLowerCase() === "pardiumsharma2590@gmail.com";
    const isCreator =
      req.session.user &&
      home.createdBy &&
      String(home.createdBy) === String(req.session.user._id);
    if (!isAdmin && !isCreator) {
      return res.status(403).send("Unauthorized: You cannot delete this home.");
    }
    await Home.findByIdAndDelete(homeId);
    res.redirect("/host/hosthome");
  } catch (err) {
    res.status(500).send("Failed to delete home.");
  }
};

exports.getData = (req, res, next) => {
  console.log("req", req.body);
  console.log("this is in getdata controllers");
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

  const houseImages = req.file ? req.file.path : null;

  const home = new Home({
    houseName,
    location,
    numberOfRooms,
    pricePerDay,
    numberOfNights,
    houseImages,
    facilities,
    createdBy: req.session.user._id,
  });

  home
    .save()
    .then(() => res.redirect("/homes"))
    .catch((err) => {
      res.status(500).send(err.message || "Something went wrong");
    });
};
exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;

  if (!homeId) {
    return res.redirect("/host/hosthome");
  }

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/hosthome");
      }

      // ✅ Ownership check
      if (home.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not allowed to edit this home.");
      }

      res.render("host/edit-home", {
        home,
        userRole: req.session.role,
        pageTitle: "Edit Home",
        currentPage: "hosthome",
        editing: req.query.editing === "true",
        user: req.session.user, //
      });
    })
    .catch((err) => {
      res.status(500).send("Failed to load home for editing");
    });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/userlogin", {
    pageTitle: "User Login",
    errors: [],
    currentPage: "userlogin",
    userRole: req.session.role,
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
        userRole: req.session.role,
        isloggedin: false,
        errors: ["User does not exist"],
        oldInput: { email, username },
      });
    }

    req.session.isloggedin = true;
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) {
        return res.redirect("/userlogin");
      }
      // Redirect after login to ensure session is available on next request
      res.redirect("/");
    });
  } catch (err) {
    res.redirect("/userlogin");
  }
};

// GET /logout
exports.logout = (req, res, next) => {
  req.session.isloggedin = false;

  req.session.save((err) => {
    if (err)
      // ✅ Clear the cookie
      res.cookie("isloggedin", false, {
        httpOnly: true,
        errors: [],
        expires: new Date(0), // clear cookie
      });

    res.render("auth/toboth", {
      pageTitle: "in the first page",
      userRole: req.session.role,
      isloggedin: req.session.isloggedin,
    });
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
      userRole: req.session.role,
      errors: [],
    });
  });
};

exports.usersignin = (req, res, next) => {
  res.render("auth/usersignin", {
    pageTitle: "User Login",
    isloggedin: false,
    userRole: req.session.role,
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
    .isIn(["Host", "guest"])

    .withMessage("Role must be either 'Host' or 'guest'"),

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
        userRole: req.session.role,
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
          req.session.role = user.role;

          req.session.save((err) => {
            if (err) {
              return res.redirect("/");
            }

            return res.render("store/index", {
              userRole: req.session.role,
              isloggedin: req.session.isloggedin,
            });
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
