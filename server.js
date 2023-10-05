import express from "express";
import User from "./models/user.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { body, validationResult } from "express-validator";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";
import { default as connectDB } from "./database/db.js";
import blogRouter from "./routes/blogs.js";
import jobApplicationRouter from "./routes/job-application.js";
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
const app = express();


// Authentication middleware to protect routes
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

// Define a Passport Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user || password !== user.password) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Define a Passport JWT Strategy for authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "khuram123",
    },
    (jwtPayload, done) => {
      // Check if the user exists in the database based on the JWT payload
      User.findById(jwtPayload._id)
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          return done(null, user);
        })
        .catch((err) => done(err, false));
    }
  )
);

const port = process.env.PORT || 5000;


// Middleware
connectDB()
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use("/api", blogRouter)
app.use("/api", jobApplicationRouter)
// Configure and use express-session
app.use(
  session({
    genid: () => uuidv4(), // Use uuidv4() here
    secret: "Khuram123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Session middleware
const sessionMiddleware = (req, res, next) => {
  if (!req.session.user) {
    req.user = null;
  } else {
    req.user = req.session.user;
  }
  next();
};

// Apply the session middleware to all routes
app.use(sessionMiddleware);

// Get current user
app.get("/api/getCurrentUser", authenticateJWT, (req, res) => {
  const user = req.user;
  const data = res.json({
    username: user.username,
    role: user.role,
  });
});

// Endpoint to fetch all users
app.get("/api/users", authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({}, "username email role password");

    return res.status(200).json(users);
    console.log(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update user data
app.put("/api/users/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  console.log({ id });
  const { username, email, password, role } = req.body;

  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Find the user by ID
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's data
    user.username = username;
    user.email = email;
    user.password = password;
    user.role = role;

    await user.save();

    return res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint to handle the login
app.post(
  "/api/auth/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const user = req.user;
    const emailParts = user.email.split("@");
    const username = emailParts[0];

    const token = jwt.sign({ _id: user._id, username }, "khuram123");

    res.json({ message: "Login successful", role: user.role, token });
  }
);

// logout route to clear the session
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.clearCookie("session");
    return res.status(200).json({ message: "Logged out successfully" });
  });
});

app.post(
  "/api/auth/register",
  [
    body("username").trim().isLength({ min: 1 }).escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create a new user instance
      const newUser = new User({
        username,
        email,
        password,
      });

      try {
        await newUser.save();
      } catch (error) {
        console.error("Error while saving user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);


// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
