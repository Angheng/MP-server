var admin = require( 'firebase-admin' );
var serviceAccount = require( './mp-finalproject-firebase-adminsdk-z7mmb-f21864dd38.json' );

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
        });

var target_token = 'ds329dYHqIw:APA91bHRyxzi_Hb_Bth8NDe3D4MDL0qKyCAWD1d0FoE30fkkNyCl_hTuZqXgTYb9KJNxWfwBvuKfzjrC8Fbrc4i5cjqKvms38orGHL4kUXkt24toNoT6SSMS1qgJrKx3R4ZK_mdMuY6G';

var msg = {
    notification: {
                  title: "test Messaging",
                  body: "Is it Really Sending Message??"
                  },

    data: {
        param: 'test',
        args: 'args'
          },

    token: target_token
};

admin.messaging().send(msg)
    .then( function(response) {
        console.log( "Correctly Sended:\t" + response );
    })
    .catch( function(error) {
        console.log( "Error Occured:\t" + error )
    });
