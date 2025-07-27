const db = require("../utils/databaseutil");

class Home {
  constructor(
    id,
    houseName,
    numberOfNights,
    pricePerDay,
    facilities,
    numberOfRooms,
    location,
    houseImages
  ) {
    this.id = id;
    this.houseName = houseName;
    this.numberOfNights = numberOfNights;
    this.pricePerDay = pricePerDay;
    this.facilities = facilities;
    this.numberOfRooms = numberOfRooms;
    this.location = location;
    this.houseImages = houseImages;
  }

  // Insert or Update a Home
  save() {
    if (this.id) {
      // Editing an existing home
      console.log("Prepared values for UPDATE:", {
        id: this.id,
        houseName: this.houseName,
        pricePerDay: this.pricePerDay,
        facilities: this.facilities,
        numberOfRooms: this.numberOfRooms,
        location: this.location,
        houseImages: this.houseImages,
        numberOfNights: this.numberOfNights,
      });

      return db.execute(
        `UPDATE homes SET
          houseName = ?, pricePerDay = ?, facilities = ?, numberOfRooms = ?,
          location = ?, houseImages = ?, numberOfNights = ?
         WHERE id = ?`,
        [
          this.houseName ?? null,
          this.pricePerDay ?? null,
          this.facilities ?? null,
          this.numberOfRooms ?? null,
          this.location ?? null,
          this.houseImages ?? null,
          this.numberOfNights ?? null,
          this.id, // ✅ id must be at the end for WHERE clause
        ]
      );
    } else {
      // Adding a new home
      return db.execute(
        `INSERT INTO homes (
          houseName, pricePerDay, facilities, numberOfRooms,
          location, houseImages, numberOfNights
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          this.houseName ?? null,
          this.pricePerDay ?? null,
          this.facilities ?? null,
          this.numberOfRooms ?? null,
          this.location ?? null,
          this.houseImages ?? null,
          this.numberOfNights ?? null,
        ]
      );
    }
  }

  // Fetch all homes
  static fetchAll() {
    return db.execute("SELECT * FROM homes");
  }

  // Find home by ID
  static findById(homeId) {
    return db.execute("SELECT * FROM homes WHERE id = ?", [homeId]);
  }

  // Delete home by ID
  static deleteById(homeId) {
    return db.execute("DELETE FROM homes WHERE id = ?", [homeId]);
  }

  // Update home by ID (static method)
  static updateById(id, updatedHome) {
    return db.execute(
      `UPDATE homes 
       SET houseName = ?, pricePerDay = ?, facilities = ?, 
           numberOfRooms = ?, location = ?, houseImages = ?, numberOfNights = ?
       WHERE id = ?`,
      [
        updatedHome.houseName ?? null,
        updatedHome.pricePerDay ?? null,
        updatedHome.facilities ?? null,
        updatedHome.numberOfRooms ?? null,
        updatedHome.location ?? null,
        updatedHome.houseImages ?? null,
        updatedHome.numberOfNights ?? null,
        id,
      ]
    );
  }
}

module.exports = Home;
