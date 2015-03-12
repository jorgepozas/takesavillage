Router.route('/login', function () {
    this.layout('ApplicationLayout');
    this.render('signup');
});

Router.route('/', function () {
    this.layout('ApplicationLayout');

    // will just get the data context from layout
    this.render('home');
});
Router.route('/createCarpool', function () {
    this.layout('ApplicationLayout');

    // will just get the data context from layout
    this.render('createCarpool');
});
Router.route('/carpools', function () {
    this.layout('ApplicationLayout');

    // will just get the data context from layout
    this.render('carpoolList');
});
Router.route('/carpool/:_id', function () {
    this.layout('ApplicationLayout');

    var carpool = TAV.Carpool.findOne({_id: this.params._id});
    Session.set('carpoolId', this.params._id);
    this.render('carpoolSchedule', {data: carpool});
});

Router.route('/invite/:_id', function () {
    this.layout('ApplicationLayout');

    var carpoolId = this.params._id;
    var email = this.params && this.params.query && this.params.query.em;

    if(Meteor.user()){
        TAV.Carpool.update({"_id": carpoolId}, {$addToSet: {"users": Meteor.userId()}, $pull: {"invites": email}});
        Router.go('/carpool/' + carpoolId);
    }else{
        Session.set('inviteCarpoolId', this.params._id);
        this.render('signup');
    }
});