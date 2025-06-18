

// // to be created later

// phoneVerificationCode: {
//     type: String,
//   },
//   phoneVerificationExpires: {
//     type: Date,
//   },



// const VerificationTokenSchema = new Schema(
//   {
//     userId: { type: Types.ObjectId, ref: "User", required: true },
//     type: {
//       type: String,
//       enum: ["phone", "email", "parental"],
//       required: true,
//     },
//     code: { type: String, required: true },
//     expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
//   },
//   { timestamps: true }
// );
// VerificationTokenSchema.index({ userId: 1, type: 1 });