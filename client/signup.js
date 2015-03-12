/**
 * Created by Jorge on 3/5/15.
 */
Template.signup.helpers({
    signInLink: function (){
        var isSignUp = Session.get('isSignUp');

        return isSignUp ? 'Sign in' : 'Create account';
    },
    showSignUp: function () {
        return Session.get('isSignUp');
    }
});


Template.signup.events({
    'click #signUpButton' : function () {
        var firstName = $('#firstNameInput').val();
        var lastName = $('#lastNameInput').val();
        var email = $('#emailInput').val();
        var password = $('#passwordInput').val();

        if(!firstName || !lastName){
            TAV.Util.showTempNotification('Please provide first and last name');
            return;
        }

        Accounts.createUser({email: email, password : password, profile : {firstName: firstName, lastName: lastName}}, function(err){
            if (err) {
                TAV.Util.showTempNotification(err.reason);
            } else {
                // Success. Account has been created and the user
                // has logged in successfully.
                TAV.Util.showTempNotification('Welcome to Takes A Village!');
                Router.go('/');
            }

        });
    },
    'click #signInButton' : function () {
        var email = $('#emailInput').val();
        var password = $('#passwordInput').val();

        Meteor.loginWithPassword(email, password, function(err){
            if (err) {
                TAV.Util.showTempNotification(err.reason);
            } else {
                var user = Meteor.user();
                var name = user && user.profile && user.profile.firstName;
                TAV.Util.showTempNotification('Welcome back ' + name + '!');
                Router.go('/carpools');
            }

        });
    },
    'click #signOut' : function () {
        Meteor.logout(function(err){
            if (err) {
                TAV.Util.showTempNotification(err.reason);
            } else {
                TAV.Util.showTempNotification('Logged out successfully');
            }

        });
    },
    'click #signInLink' : function () {
        var isSignUp = Session.get('isSignUp');
        Session.set('isSignUp', !isSignUp);
    }
});
