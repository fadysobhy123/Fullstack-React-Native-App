const db = require('../db');

// Create Post
exports.createPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const postedBy = req.user.id; // Get user ID from authenticated user

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const sql = `INSERT INTO Posts (Title, Description, PostedBy) VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [title, description, postedBy]);

        res.status(201).json({
            message: 'Post created successfully',
            postId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Posts
exports.getPosts = async (req, res) => {
    try {
        const sql = `SELECT * FROM Posts ORDER BY Id DESC`;
        const [rows] = await db.query(sql);
        res.json(rows);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Posts with User Info (JOIN)
exports.getPostsWithUsers = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.Id AS PostId,
                p.Title,
                p.Description,
                p.CreatedAt,
                u.Id AS UserId,
                u.Name AS UserName,
                u.Email AS UserEmail
            FROM Posts p
            JOIN Users u ON p.PostedBy = u.Id
            ORDER BY p.Id DESC
        `;

        const [rows] = await db.query(sql);
        res.json(rows);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Single Post
exports.getPostById = async (req, res) => {
    try {
        const sql = `SELECT * FROM Posts WHERE Id = ?`;
        const [rows] = await db.query(sql, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Post
exports.updatePost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const postId = req.params.id;

        // Validate input
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Check if post exists
        const checkSql = `SELECT * FROM Posts WHERE Id = ?`;
        const [existingPost] = await db.query(checkSql, [postId]);

        if (existingPost.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update the post
        const sql = `UPDATE Posts SET Title = ?, Description = ? WHERE Id = ?`;
        const [result] = await db.query(sql, [title, description, postId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Failed to update post' });
        }

        res.json({ message: 'Post updated successfully' });

    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Post
exports.deletePost = async (req, res) => {
    try {
        const sql = `DELETE FROM Posts WHERE Id = ?`;
        await db.query(sql, [req.params.id]);

        res.json({ message: 'Post deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
