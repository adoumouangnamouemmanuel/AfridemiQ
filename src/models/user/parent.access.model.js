const mongoose = require("mongoose");
const { Schema } = mongoose;

const ParentAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    parentEmail: { type: String, required: true },
    accessLevel: {
      type: String,
      enum: ["viewProgress", "viewReports", "fullAccess"],
      required: true,
    },
    notifications: [
      {
        type: String,
        frequency: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  ParentAccess: mongoose.model("ParentAccess", ParentAccessSchema),
};
