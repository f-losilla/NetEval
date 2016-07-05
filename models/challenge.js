var mongoose = require("mongoose");

var challengeSchema = new mongoose.Schema({
    user: String,
    ip: String,
    date: String,
    challenge_id: String,
    path: String,
    title: String,
    description: String,
    challenge_group: String
});

challengeSchema.index({"challenge_id": 1}, {"unique": true});

module.exports = mongoose.model("Challenge", challengeSchema);

// table: challenge_id, user (owner), ip, date