Template.ApplicationLayout.helpers({
   notification: function () {
        return Session.get('notificationMessage');
   }
});

Template.carpoolList.helpers({
    carpool: function (){
        if(TAV.Util.isAdmin()){
            return TAV.Carpool.find({});
        }else {
            return TAV.Carpool.find({users: {$in: [Meteor.userId()]}});
        }
    }
});

Template.createCarpool.rendered = function() {
    $('#startDateInput').datepicker();
    $('#endDateInput').datepicker();
};

Template.createCarpool.events({
    'click #createCarpoolButton' : function () {
        var name = $('#nameInput').val();
        var origin = $('#originInput').val();
        var destination = $('#destinationInput').val();
        var startDate = $('#startDateInput').val();
        var endDate = $('#endDateInput').val();
        var pickupTime = $('#timepickerInput').val();
        var dayOfWeek = "";

        dayOfWeek += $('#monCheckbox').prop( "checked" ) ? 'Mo' : '';
        dayOfWeek += $('#tueCheckbox').prop( "checked" ) ? 'Tu' : '';
        dayOfWeek += $('#wedCheckbox').prop( "checked" ) ? 'We' : '';
        dayOfWeek += $('#thuCheckbox').prop( "checked" ) ? 'Th' : '';
        dayOfWeek += $('#friCheckbox').prop( "checked" ) ? 'Fr' : '';
        dayOfWeek += $('#satCheckbox').prop( "checked" ) ? 'Sa' : '';
        dayOfWeek += $('#sunCheckbox').prop( "checked" ) ? 'Su' : '';

        if(name && Meteor.user){
            var currentDate = new Date();
            var schedule = {'origin': origin, 'destination': destination, 'startDate': startDate, 'endDate': endDate, 'pickupTime': pickupTime, 'dayOfWeek': dayOfWeek};

            var slots = TAV.Util.generateSlots(schedule);

            TAV.Carpool.insert({'name': name, 'users': [Meteor.userId()], 'schedules': [schedule], 'slots':slots, 'dateAdded': currentDate, 'creatorId': Meteor.userId()});
            Router.go('/carpools');
        }
    }
});

Template.carpoolSchedule.helpers({
    parentSlots: function (){
        var result = [];
        var userId = Meteor.userId();
        var picks = this.parentSlots && this.parentSlots[userId];

        if(!picks && !TAV.Util.isAdmin()){
            picks = [];
            var slots = this.slots;

            if(slots){
                var arrayLength = slots.length;
                for (var i = 0; i < arrayLength; i++) {
                    var slotDate = new Date(slots[i]);
                    picks.push({'date': slotDate, 'available':1});
                }

                var updateVal = {};
                updateVal["parentSlots." + userId] = picks;
                TAV.Carpool.update({"_id": this._id},
                    {"$set": updateVal});
            }
        }

        return picks;
    },
    userName: function () {
        var user = Meteor.users.findOne({_id: this.toString()});
        return user && user.profile && (user.profile.firstName + " " + user.profile.lastName);
    },
    notAdmin: function () {
        return !TAV.Util.isAdmin();
    },
    showSummary: function () {
        return this.summaryStatus == 1 || TAV.Util.isAdmin();
    },
    summaryTitle: function () {
        return TAV.Util.isAdmin() ? "Summary" : "Scheduled Rides";
    },
    summarySubtitle: function () {
        return TAV.Util.isAdmin() ? "Select optimized schedule based on given availability" : "These are the optimized rides according to availability provided by users.";
    },
    summaryStatus: function () {
        var users = (this.invites && this.invites.length || 0) + (this.users && this.users.length || 0);
        var readyToSchedule = (this.parentSlots && Object.keys(this.parentSlots).length || 0) === users;
        return TAV.Util.isAdmin() ? (this.summaryStatus == 1 ? "Schedule has been submitted" : (readyToSchedule ? "Please submit schedule" : "Waiting for user input")) : (this.summaryStatus == 1 ? "Schedule is ready" : "");
    }
});

Template.carpoolSchedule.events({
    'click #invitePeople' : function () {
        var user = Meteor.user();
        var name = user && user.profile && (user.profile.firstName + " " + user.profile.lastName);
        var carpoolId = Session.get('carpoolId');

        // TODO: Validate emails
        var text = $('#inviteText').val();
        var emails = text.split(";");

        TAV.Carpool.update({"_id": carpoolId},
            {$addToSet: { invites: { $each: emails } }});

        Meteor.call('sendEmails', emails, name, carpoolId, this.name, function (error, result) {
            if (error) {
                // handle error
                alert(error);
            } else {
                // examine result
            }
        });

        TAV.Util.showTempNotification('Invites sent.');
        $('#inviteText').val('');
    },
    'click #summaryFinished' : function() {
        var carpoolId = Session.get('carpoolId');

        TAV.Carpool.update({"_id": carpoolId},
            {$set: { summaryStatus: 1 }});

        TAV.Util.showTempNotification('Schedule submitted');
    }
});

Template.scheduleSlot.helpers({
    dateString: function () { // data context set to profile.name
        return moment(this.date).format('ddd MMM D');
    },
    buttonImage: function () {
        return TAV.Util.getButtonImage(this.available);
    }
});

Template.scheduleSlot.events({
    'click .slot .button' : function () {
        var available = 1;
        if(this.available === 1){
            available = 2;
        }else if(this.available === 2) {
            available = 3;
        }
        this.available = available;

        Meteor.call('updateAvailability', Template.parentData()._id, this.date, available, function (error, result) {
            if (error) {
                // handle error
            } else {
                // examine result
            }
        });
    }
});

Template.summary.helpers({
    dateString: function () { // data context set to profile.name
        return moment(this).format('ddd MMM D');
    },
    initials: function () {
        var date = moment(this).format('MMDDYYHHmm');
        var parentId = Template.parentData().assignedSlots && Template.parentData().assignedSlots[date];
        var user = Meteor.users.findOne({_id: parentId});
        var result = user && user.profile && user.profile.firstName && user.profile.lastName && (user.profile.firstName.substr(0,1) + user.profile.lastName.substr(0,1));
        return result ? result : "NA";
    },
    rowHeaderCssClass: function () {
        var date = moment(this).format('MMDDYYHHmm');
        var parentId = Template.parentData().assignedSlots && Template.parentData().assignedSlots[date];
        if(Meteor.userId() === parentId) {
            return 'currentUser';
        }
    }
});

Template.summaryColumn.helpers({
    initials: function () {
        var user = Meteor.users.findOne({_id: this.toString()});
        return user && user.profile.firstName;
    },
    parentSlots: function (){
        var picks = Template.parentData().parentSlots && Template.parentData().parentSlots[this.toString()];
        return picks;
    }
});

Template.summarySlot.helpers({
    buttonImage: function () {
        return TAV.Util.getButtonImage(this.available);
    },
    summarySlotSelection: function () {
        var date = moment(this.date).format('MMDDYYHHmm');
        var assignedParentId = Template.parentData(2).assignedSlots && Template.parentData(2).assignedSlots[date];
        var columnUserId = Template.parentData();
        if(columnUserId === assignedParentId) {
            return 'summarySlotSelection';
        }
    }
});

Template.summarySlot.events({
    'click .assignButton' : function () {
        if(TAV.Util.isAdmin()){
            var userId = Template.parentData();
            var date = moment(this.date).format('MMDDYYHHmm');
            var carpoolId = Session.get('carpoolId');

            var updateVal = {};
            updateVal["assignedSlots." + date] = userId;

            TAV.Carpool.update({"_id": carpoolId},
                {"$set": updateVal});
        }
    }
});

Template.chat.helpers({
    comments: function (){
        var carpoolId = Session.get('carpoolId');

        return TAV.Message.find({'carpoolId': carpoolId});
    },
    notAdmin: function () {
        return !TAV.Util.isAdmin();
}
});

Template.chat.events({
    'click #submitCommentButton' : function () {
        var text = $('#commentText').val();
        var carpoolId = Session.get('carpoolId');

        if(text && Meteor.user && carpoolId){
            var currentDate = new Date();
            TAV.Message.insert({'text': text, 'dateAdded': currentDate, 'carpoolId': carpoolId, 'userId': Meteor.userId()});

            $('#commentText').val('');
        }
    }
});

Template.chatComment.helpers({
    dateAdded: function(){
        return this.dateAdded ? moment(this.dateAdded).fromNow() : '';
    },
    userName: function() {
        if(this.userId){
            var user = Meteor.users.findOne({'_id': this.userId});
            return user && user.profile && (user.profile.firstName + " " + (user.profile.lastName && user.profile.lastName.substr(0,1)));
        }

    }
});
