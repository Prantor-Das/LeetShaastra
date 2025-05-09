import express from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    resendEmailVerification,
    resetForgottenPassword,
    forgotPasswordRequest,
    changeCurrentPassword,
    getCurrentUser
} from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { validateRegister, validateLogin, validatePasswordChange } from "../middleware/validation.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendEmailVerification);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/reset-password/:token", resetForgottenPassword);
// router.post("/generate-token", generateTokens);

// Protected routes (require authentication)
router.use(isLoggedIn); // Apply authentication middleware to all routes below
router.get("/me", getCurrentUser);
router.post("/logout", logoutUser);
router.post("/change-password", validatePasswordChange, changeCurrentPassword);

export default router;
