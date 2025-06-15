import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js";
import { db } from "../libs/db.js";
import { UserRole } from "../../generated/prisma/index.js";


// Helper function to generate tokens
const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  
  return { accessToken, refreshToken };
};

const registerUser = async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role || UserRole.USER,
        isVerified: false,
      },
    });

    const token = await crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
      },
    });

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${token}`;
    await sendEmail({
      email: user.email,
      subject: "Verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        verificationUrl
      ),
    });

    const { accessToken, refreshToken } = await generateTokens(user.id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "User created successfully. Please verify your email.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 })
      .cookie("refreshToken", refreshToken, { ...options, maxAge: 1 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          image: user.image,
          isVerified: user.isVerified,
          refreshToken: refreshToken || User.refreshToken,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully"
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendEmailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${token}`;
    await sendEmail({
      email: user.email,
      subject: "Verify your email",
      mailgenContent: emailVerificationMailgenContent(user.username, verificationUrl),
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;
    await forgotPasswordMailgenContent({
      email: user.email,
      subject: "Password Reset Request",
      mailgenContent: forgotPasswordMailgenContent(user.username, resetUrl),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetForgottenPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  try {
    const user = await db.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changeCurrentPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both current and new password are required",
    });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
    });

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendEmailVerification,
  resetForgottenPassword,
  forgotPasswordRequest,
  changeCurrentPassword,
  getCurrentUser,
};
