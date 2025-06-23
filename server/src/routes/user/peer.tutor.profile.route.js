const express = require("express");
const router = express.Router();
const peerTutorProfileController = require("../../controllers/user/peer.tutor.profile.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createPeerTutorProfileSchema,
  updatePeerTutorProfileSchema,
  addReviewSchema,
  getPeerTutorProfileSchema,
} = require("../../schemas/user/peer.tutor.profile.schema");

router.use(apiLimiter);
router.use(authMiddleware);

// Profile operations
router.post(
  "/",
  validateMiddleware(createPeerTutorProfileSchema),
  peerTutorProfileController.createProfile
);
router.get("/my-profile", peerTutorProfileController.getMyProfile);
router.get(
  "/",
  validateMiddleware(getPeerTutorProfileSchema, "query"),
  peerTutorProfileController.getProfiles
);

// Individual profile operations
router.get("/:id", peerTutorProfileController.getProfileById);
router.put(
  "/:id",
  validateMiddleware(updatePeerTutorProfileSchema),
  peerTutorProfileController.updateProfile
);
router.delete("/:id", peerTutorProfileController.deleteProfile);
router.post(
  "/:id/reviews",
  validateMiddleware(addReviewSchema),
  peerTutorProfileController.addReview
);

// Admin operations
router.get(
  "/admin/profiles",
  roleMiddleware(["admin"]),
  validateMiddleware(getPeerTutorProfileSchema, "query"),
  peerTutorProfileController.getProfiles
);

module.exports = router;