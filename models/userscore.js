var mongoose = require("mongoose");

var userScoreSchema = new mongoose.Schema({
    username: String,
    ip: String,
    date: String,
    score: Number,
    challenge_id: String,
    num_attemps: Number,
    best: { "type": mongoose.Schema.Types.ObjectId, "ref": 'Submission' },
    last: { "type": mongoose.Schema.Types.ObjectId, "ref": 'Submission' },
    first: { "type": mongoose.Schema.Types.ObjectId, "ref": 'Submission' },
    submissions: [{ "type": mongoose.Schema.Types.ObjectId, "ref": 'Submission'}],
    scores: [{"type": mongoose.Schema.Types.ObjectId, "ref": "Submission"}], // scores for submitted challenges, unused!
    ok_after_attemps: Number // number of attempts until all restrictions are satisfied
});
//}, { versionKey: false });

userScoreSchema.index({"challenge_id": 1, "username": 1}, {"unique": true});

module.exports = mongoose.model("UserScore", userScoreSchema);


/*    user: String,
    score: Number,
    date: String,
    ip: String,
    last:
    best:*/