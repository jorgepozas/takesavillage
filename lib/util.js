/**
 * Created by Jorge on 2/26/15.
 */
TAV.Util = {};
TAV.Util.generateSlots = function(schedule) {
    var result = [];
    if(schedule){
       var startDate = moment(schedule.startDate);
        var endDate = moment(schedule.endDate);
        var daysOfWeek = schedule.dayOfWeek;

        var date = startDate;
        while(endDate.diff(date, 'days') >= 0){
            var day = date.format("dd");
            if(daysOfWeek.indexOf(day) > -1){
                var convertedDate = new Date(date.toDate());
                result.push(convertedDate);
            }
            date.add(1, 'd');
        }
    }
    return result;
};

TAV.Util.getButtonImage = function(available){
    return available == 1 ? '/buttonBlue.png' : available == 2 ? '/buttonGreen.png' : '/buttonRed.png';
};

TAV.Util.isAdmin = function(){
    var user = Meteor.user();
    return user && user.profile && user.profile.firstName === "Admin";
};

TAV.Util.showTempNotification = function(message) {
    Session.set('notificationMessage', message);

    setTimeout(function(){
        Session.set('notificationMessage', '');
    }, 3000);
};