import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User document interface.
 */
export interface IUser extends Document {
  _id: string;

  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role: "User" | "Agent" | "Admin";
  departments?: string[];

  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User schema.
 */
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["User", "Agent", "Admin"],
      default: "User",
    },

    departments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving.
 * Runs only when password is modified.
 */
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare plaintext password with hashed password.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
export default User;
