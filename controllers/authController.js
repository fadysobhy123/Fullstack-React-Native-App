const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 




exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email and password are required" });

    if (password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters long" });

    try {
        // Check if email exists
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), email.trim(), hashedPassword]
        );

        return res.status(201).json({ message: "User registered successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

    try {
        const [userData] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = userData[0];

        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,      // use process.env.JWT_SECRET in production
            { expiresIn: "70d" }
        );

        res.json({
            success:true,
            message: "Login successfully",
            user,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateUser = async (req, res) => {
    const { name, email, password, userId } = req.body;
    const userIdToUse = req.user?.id || userId; // Use JWT user ID or fallback to body userId

    // Validation
    if (!name && !email && !password) {
        return res.status(400).json({ message: "At least one field (name, email, or password) is required" });
    }

    if (password && password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    try {
        // Validation for userId
        if (!userIdToUse) {
            return res.status(400).json({ message: "User ID is required (either from token or request body)" });
        }

        // Check if user exists
        const [userData] = await db.query("SELECT * FROM users WHERE id = ?", [userIdToUse]);
        const user = userData[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== user.email) {
            const [existing] = await db.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, userIdToUse]);
            if (existing.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (name) {
            updates.push("name = ?");
            values.push(name.trim());
        }

        if (email) {
            updates.push("email = ?");
            values.push(email.trim());
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push("password = ?");
            values.push(hashedPassword);
        }

        // Add user ID for WHERE clause
        values.push(userIdToUse);

        // Execute update query
        await db.query(
            `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
            values
        );

        // Get updated user data (excluding password)
        const [updatedUserData] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [userIdToUse]);
        const updatedUser = updatedUserData[0];

        res.json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



