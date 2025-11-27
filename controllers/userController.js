const db = require('../db');

exports.getAllUsers = async (req, res) => {
    try {
        // Select only safe fields (no password!)
        const [users] = await db.query(
            "SELECT id, name, email, role, created_at, updated_at FROM users"
        );

        res.json({
            success: true,
            count: users.length,
            users: users
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
