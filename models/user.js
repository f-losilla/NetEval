var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    email: String,
    role: String,
//    role: String,
//    password: String,
    challenges: [{type: mongoose.Schema.Types.ObjectId, ref: 'Challenge'}], // created challenges
    scores: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserScore'}] // scores for submitted challenges
});


var userModel = mongoose.model("User", userSchema);

/*userModel.isOk = function (obj){
    if (!("user_id" in obj) || obj["user_id"] == "") return false;
    return true;
}

userModel.exists = function (obj){
    var user_obj = {};
    var res = false;
    user_obj["user_id"] = obj["user_id"];
console.log(user_obj);

    userModel.find(user_obj, function(err, users){
        if (err) console.log(err)
        else {
            console.log("else")
            console.log(users);
                    console.log(users[0] != null);
            if (users[0] != null){
                console.log("puesto res a true");
                res = true;
            }
        }
    })

    console.log("Esto no se ejecuta?")
    console.log("res final = " + res);
    return res;
}
*/
module.exports = userModel;

/*-name: String
-role: String
-access_token: String
-challengess: Challenge[0..*]
-scores: ChallengeScore[0..*]*/