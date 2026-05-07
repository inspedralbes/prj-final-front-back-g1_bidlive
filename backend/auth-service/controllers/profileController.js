const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar_${req.user.userId}_${Date.now()}${ext}`);
    },
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("INVALID_FORMAT"));
        }
    },
});

const profileController = {
    // GET /profile/:id — public profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (err) {
            console.error("getProfile error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // PUT /profile — update username & bio (auth required)
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { username, bio } = req.body;

            if (!username || username.trim() === "") {
                return res.status(400).json({ message: "Username is required" });
            }

            // Check uniqueness — allow current user to keep their own username
            const existing = await User.findByUsername(username.trim());
            if (existing && existing.id !== userId) {
                return res.status(409).json({ message: "Username already taken" });
            }

            await User.updateBasicProfile(userId, { username: username.trim(), bio: bio || "" });

            const updatedUser = await User.findById(userId);
            res.json({ message: "Profile updated", user: updatedUser });
        } catch (err) {
            console.error("updateProfile error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // POST /profile/avatar — upload avatar image (auth required)
    uploadAvatar: [
        (req, res, next) => {
            upload.single("avatar")(req, res, (err) => {
                if (err) {
                    if (err.message === "INVALID_FORMAT") {
                        return res.status(400).json({
                            message: "Invalid file format. Please use JPG, PNG, WebP or GIF.",
                        });
                    }
                    return res.status(400).json({ message: err.message });
                }
                next();
            });
        },
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "No file uploaded" });
                }

                const userId = req.user.userId;
                const avatarUrl = `/auth/uploads/avatars/${req.file.filename}`;

                await User.updateAvatar(userId, avatarUrl);

                res.json({ message: "Avatar updated", avatar_url: avatarUrl });
            } catch (err) {
                console.error("uploadAvatar error:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        },
    ],

    // GET /profile/search — search users by name or bio
    searchUsers: async (req, res) => {
        try {
            const { q, limit, offset } = req.query;
            let users;
            if (q && q.trim() !== "") {
                users = await User.search(q, limit, offset);
            } else {
                users = await User.getTopSellers(limit);
            }
            res.json(users);
        } catch (err) {
            console.error("searchUsers error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

module.exports = profileController;
