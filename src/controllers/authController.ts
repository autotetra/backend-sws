import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = (await User.findOne({ email })) as IUser | null;
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare provided password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Create JWT payload
    const payload = {
      id: user.id, // or typedUser._id.toString()
      email: user.email,
      role: user.role,
    };

    // 4. Sign the JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // 5. Send token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    // Extract user details from the request body
    const { firstName, lastName, email, password, role } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Create a new user object with the provided details
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // will be hashed automatically via pre-save middleware
      role,
    });

    // Save the new user to the database
    await newUser.save();

    // Return success message
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    // Handle any unexpected errors
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
