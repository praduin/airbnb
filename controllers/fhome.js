const Home = require("../models/home");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // ✅ fixed typo: "uplaods" -> "uploads"
const Favorite = require("../models/favorite");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    isloggedin: req.isloggedin,
    pageTitle: "Add Home to Airbnb",
    currentPage: "addhome",
    editing: false,
  });
};

exports.getHome = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes,
      isloggedin: req.isloggedin,
      pageTitle: "Homes List",
      currentPage: "home",
    });
  });
};

exports.postEditHome = async (req, res) => {
  const id = req.params.homeId; // ✅ Correct param name

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

  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.facilities = facilities;
      home.location = location;
      home.pricePerDay = pricePerDay;
      home.numberOfRooms = numberOfRooms;
      home.numberOfNights = numberOfNights;
      home.houseImages = houseImages; // Use the new image or keep the existing one

      home
        .save()
        .then(() => {
          console.log("Home updated successfully");
        })
        .catch((err) => {
          console.log("Error updating home:", err);
        });
      res.redirect("/host/hosthome", {
        isloggedin: req.isloggedin,
      });
      {
      }
    })
    .catch((err) => {
      console.log("Error finding home:", err);
    });
};

exports.getIndex = (req, res, next) => {
  console.log("session value", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes,
      isloggedin: req.isloggedin,
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
  res.render("store/booking", {
    pageTitle: "My Bookings",
    isloggedin: false,
    isloggedin: req.isloggedin,
    currentPage: "bookings",
  });
};

exports.getfavrouited = (req, res, next) => {
  Favorite.find()
    .populate("homeId")
    .then((favoriteList) => {
      const favoriteHomes = favoriteList
        .map((fav) => fav.homeId)
        .filter((home) => home !== null); // ✅ remove nulls

      res.render("store/favoritehome", {
        isloggedin: req.isloggedin,
        favoriteHomes,
        isloggedin: false,
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
  const homeId = req.body.id;

  Favorite.findOne({ homeId: homeId })
    .then((existingFavorite) => {
      if (existingFavorite) {
        console.log("Home already in favorites:", homeId);
        res.redirect("/favoritehome", { isloggedin: req.isloggedin });
        return null; // 🛑 Stop here, don’t go to next .then
      }

      const fav = new Favorite({ homeId: homeId });
      return fav.save(); // only if not found
    })
    .then((result) => {
      if (result) {
        res.redirect("/favoritehome", {
          isloggedin: req.isloggedin,
        });
      }
      // else already redirected, do nothing
    })
    .catch((err) => {
      console.error("Error adding home to favorites:", err);
      if (!res.headersSent) {
        res.status(500).send("Failed to add to favorites");
      }
    });
};

exports.postremoveFromFavorite = (req, res, next) => {
  const homeId = req.body.id;

  if (!homeId || !homeId.match(/^[a-f\d]{24}$/i)) {
    console.error("Invalid homeId:", homeId);
    return res.redirect("/favoritehome", {
      isloggedin: req.isloggedin,
    });
  }

  Favorite.findOneAndDelete({ homeId: homeId })
    .then((result) => {
      console.log("Home removed:", result);
      res.redirect("/favoritehome", { isloggedin: req.isloggedin });
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
    res.redirect("/host/hosthome", {
      isloggedin: req.isloggedin,
    });
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
    return res.redirect("/host/hosthome", {
      isloggedin: req.isloggedin,
    });
  }

  console.log("findById called with homeId:", homeId);

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/hosthome", {
          isloggedin: req.isloggedin,
        });
      }

      res.render("host/edit-home", {
        home,
        isloggedin: req.isloggedin,
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
  res.render("auth/userlogin", {
    pageTitle: "User Login",
    currentPage: "userlogin",
    isloggedin: false,
  });
};
exports.logindones = (req, res, next) => {
  req.session.isloggedin = true;
  res.render("store/index", {
    isloggedin: req.isloggedin,
    currentPage: "userlogin",
  });
};

exports.logout = (req, res, next) => {
  res.cookie("isloggedin", false);
  res.render("auth/userlogin", { pageTitle: "User Login" });
};
exports.postlogout = (req, res, next) => {
  {
    req.sesson.destroy(() => {
      res.redirect("/index");
    });
  }
};
