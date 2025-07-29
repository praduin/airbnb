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
  if (!res.isloggedin) {
    console.log("thiis is in sign in page ");
    return res.redirect("/auth/userlogin");
  }

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

  Favorite.findOne({ homeId })
    .then((existingFavorite) => {
      if (existingFavorite) {
        console.log("Home already in favorites:", homeId);
        return res.redirect("/favoritehome"); // ❌ Removed second argument
      }

      const fav = new Favorite({ homeId });
      return fav.save();
    })
    .then((result) => {
      if (result) {
        return res.redirect("/favoritehome");
      }
      // Already redirected if it existed
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
  res.render("auth/userlogin", {
    pageTitle: "User Login",
    currentPage: "userlogin",
    isloggedin: false,
  });
};
exports.logindones = (req, res, next) => {
  res.cookie("isloggedin", true);

  req.session.save((err) => {
    if (err) {
      console.log("Session save error:", err);
      return res.redirect("/");
    }

    res.redirect("/"); // or wherever your home page is
  });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log("Error destroying session:", err);
    res.redirect("/userlogin");
  });
};
exports.postlogout = (req, res, next) => {
  {
    req.session.destroy(() => {
      res.redirect("/index");
    });
  }
};
