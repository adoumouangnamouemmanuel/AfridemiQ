const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user/user.route");
const errorMiddleware = require("./middlewares/error.middleware");
require("dotenv").config();

const app = express();
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"));

app.use("/api/users", userRoutes(userRoutes));
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
