const Follower = require("../models/Follower");

exports.toggleFollow = async (req, res) => {
  try {
    const followerId = req.userId;
    const { sellerId } = req.body;

    if (!sellerId) return res.status(400).json({ message: "Seller ID required" });
    if (followerId === parseInt(sellerId)) return res.status(400).json({ message: "No puedes seguirte a ti mismo" });

    const isFollowing = await Follower.isFollowing(followerId, sellerId);
    if (isFollowing) {
      await Follower.unfollow(followerId, sellerId);
      return res.json({ following: false, message: "Has dejado de seguir a este vendedor" });
    } else {
      await Follower.follow(followerId, sellerId);
      return res.json({ following: true, message: "Ahora sigues a este vendedor" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkFollowing = async (req, res) => {
  try {
    const followerId = req.userId;
    const { sellerId } = req.params;
    const following = await Follower.isFollowing(followerId, sellerId);
    res.json({ following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await Follower.getFollowersCount(userId);
    const following = await Follower.getFollowingCount(userId);
    res.json({ followers, following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInternalFollowers = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { secret } = req.query;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const followers = await Follower.getFollowers(sellerId);
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
