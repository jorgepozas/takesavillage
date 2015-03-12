// On the server

Meteor.methods({
    updateAvailability: function (carpoolId, date, available) {

        var userId = this.userId;
        var selectVal = {};
        selectVal["_id"] = carpoolId;
        selectVal["parentSlots." + userId + ".date"] = date;
        var updateVal = {};
        updateVal["parentSlots." + userId + ".$.available"] = available;

        TAV.Carpool.update(
            selectVal,
            { $set: updateVal }
        )
    },
    sendEmails: function(emails, fromName, carpoolId, carpoolName){
        for(var i=0; i<emails.length; i++) {
            var email = emails[i];
            if(email){
                Email.send({
                    from: "takesavillage15@gmail.com",
                    fromname: fromName,
                    to: email,
                    subject: fromName + " has invited you to TakesAVillage Carpool",
                    html: "You have been invited to join the '" + carpoolName + "' carpool by " + fromName + "<br/>" +
                        "<a href='carpool.meteor.com/invite/" + carpoolId + "?em=" + email + "'> Join " + carpoolName + "</a>"
                });
            }
        }
    }
});