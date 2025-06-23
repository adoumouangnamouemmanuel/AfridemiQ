const mongoose = require("mongoose");

// Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion:", err));

// Function to drop problematic indexes
async function dropCourseContentIndexes() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("coursecontents");

    // Get all existing indexes
    const indexes = await collection.indexes();
    console.log("Index existants :");
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the problematic index if it exists
    const problematicIndexName = "modules.lessons_1_series_1";
    try {
      await collection.dropIndex(problematicIndexName);
      console.log(`Index problématique supprimé : ${problematicIndexName}`);
    } catch (error) {
      if (error.code === 27) {
        console.log(`Index ${problematicIndexName} n'existe pas - OK`);
      } else {
        console.log(
          `Erreur lors de la suppression de l'index : ${error.message}`
        );
      }
    }

    // Try to drop any other indexes with parallel arrays
    const indexesToDrop = indexes.filter((index) => {
      const key = index.key;
      const hasSeriesArray = key.series !== undefined;
      const hasModulesArray = Object.keys(key).some((k) =>
        k.startsWith("modules.")
      );
      return hasSeriesArray && hasModulesArray && index.name !== "_id_";
    });

    for (const index of indexesToDrop) {
      try {
        await collection.dropIndex(index.name);
        console.log(`Index avec tableaux parallèles supprimé : ${index.name}`);
      } catch (error) {
        console.log(
          `Erreur lors de la suppression de l'index ${index.name} : ${error.message}`
        );
      }
    }

    // Get updated indexes
    const updatedIndexes = await collection.indexes();
    console.log("\nIndex restants :");
    updatedIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\nSuppression des index terminée avec succès");

    // Close connection
    await mongoose.connection.close();
    console.log("Connexion MongoDB fermée");
  } catch (error) {
    console.error("Erreur lors de la suppression des index :", error);
    process.exit(1);
  }
}

// Execute the function
dropCourseContentIndexes();
