const Home = require("../models/home");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // ✅ fixed typo: "uplaods" -> "uploads"
const favorite = require("../models/favorite");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Airbnb",
    currentPage: "addhome",
    editing: false,
  });
};

exports.getHome = (req, res, next) => {
  Home.fetchAll().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes,
      pageTitle: "Homes List",
      currentPage: "home",
    });
  });
};

exports.postEditHome = async (req, res) => {
  const _id = req.params._id;

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
    const home = new Home(
      _id, // Use _id for MongoDB
      houseName,
      numberOfNights,
      pricePerDay,
      facilities,
      numberOfRooms,
      location,
      houseImages
    );

    home.save().then(() => {
      console.log("home saved successfully");
    });
    res.redirect("/host/hosthome");
  } catch (err) {
    console.error("Error updating home:", err);
    res.status(500).send("Failed to update home");
  }
};

exports.getIndex = (req, res, next) => {
  Home.fetchAll().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes,
      pageTitle: "All Homes",
      currentPage: "home",
    });
  });
};

exports.gethosthome = (req, res, next) => {
  Home.fetchAll().then((registeredHomes) => {
    res.render("host/hosthome", {
      registeredHomes,
      pageTitle: "Host Homes",
      currentPage: "hosthome",
    });
  });
};

exports.homepage = (req, res, next) => {
  Home.fetchAll()
    .then(([registeredHomes]) => {
      res.render("store/home-list", {
        registeredHomes,
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
    currentPage: "bookings",
  });
};

exports.getfavrouited = (req, res, next) => {
  favorite.getFavorite((favoriteList) => {
    Home.fetchAll().then((registeredHomes) => {
      const favoriteHomes = registeredHomes.filter((home) =>
        favoriteList.includes(_id)
      );

      res.render("store/favoritehome", {
        favoriteHomes,
        pageTitle: "My Favorites",
        currentPage: "favourites",
      });
    });
  });
};

exports.getHomeDetail = (req, res, next) => {
  const _id = req.params._id;

  if (!_id) {
    return res.redirect("/");
  }

  Home.findById(_id)
    .then((rows) => {
      const hom = rows[0];
      if (!hom) {
        return res.redirect("/homes");
      }
      res.render("store/home-detail", {
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
  favorite.addToFavorite(req.body.id, (error) => {
    if (error) {
      console.error("Error adding to favorite:", error);
      return res.redirect("/error");
    }

    res.redirect("/favoritehome");
  });
};

exports.postremoveFromFavorite = (req, res, next) => {
  const _id = req.body._id;

  favorite.removeFromFavorite(_id, (err) => {
    if (err) {
      console.error("Failed to remove from favorites:", err);
      return res.redirect("/error");
    }
    res.redirect("/favoritehome");
  });
};

exports.deletehomewithid = async (req, res, next) => {
  const _id = req.params._id;

  try {
    await Home.deleteById(_id);
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

  const home = new Home(
    null, // New home, no id yet
    houseName,
    numberOfNights,
    pricePerDay,
    facilities,
    numberOfRooms,
    location,
    houseImages
  );

  home
    .save()
    .then(() => res.redirect("/host/hosthome"))
    .catch((err) => {
      console.error("Error saving home:", err);
      res.status(500).send("Something went wrong");
    });
};

exports.getEditHome = async (req, res, next) => {
  const _id = req.params._id;
  const editing = req.query.editing === "true";

  try {
    const [rows] = await Home.findById(_id);
    const home = rows[0];

    if (!home) {
      return res.redirect("/host/hosthome");
    }

    res.render("host/edit-home", {
      pageTitle: "Edit Your Home",
      currentPage: "hosthome",
      home,
      editing: true,
    });
  } catch (err) {
    console.error("Error fetching home for edit:", err);
    res.status(500).send("Database error");
  }
};
