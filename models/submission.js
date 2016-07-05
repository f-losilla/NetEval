var mongoose = require("mongoose");

var submissionSchema = new mongoose.Schema({
    user: String,
    ip: String,
    date: String,
    score: Number,
    network: mongoose.Schema.Types.Mixed,
    challenge_id: String,
    challenge: mongoose.Schema.Types.Mixed,
//    role: String,
//    password: String,
    challenges: [mongoose.Schema.Types.ObjectId], // created challenges
    scores: [mongoose.Schema.Types.ObjectId], // scores for submitted challenges, not used?
    num_submission: Number
});

var submissionModel = mongoose.model("Submission", submissionSchema);
module.exports = submissionModel;
