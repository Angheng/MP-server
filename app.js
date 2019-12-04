var express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use( bodyParser.urlencoded( {extended:true} ) );
app.use( bodyParser.json() );
app.set( 'view engine', 'ejs' );
app.engine( 'html', require('ejs').renderFile );

var options = {
    setHeader: function(res, path, stat){
        res.set( 'charset', 'EUC-KR' );
    }
}
app.use( '/images', express.static('storeImage', options) );

var admin = require('firebase-admin');
var serviceAccount = require('./mp-finalproject-firebase-adminsdk-z7mmb-f21864dd38.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
        });

var fs = require('fs');
var urlencode = require('urlencode');

var mysql = require( 'mysql' );
var connection = mysql.createConnection({
    host: '54.180.153.64',
    user: 'MPuser',
    password: '13572468',
    database: 'MPDB'
        });

connection.connect();


app.get('/', function (req, res) {

        connection.query( 'SELECT * FROM users', function (err, data, fields) {
                if ( err ) throw err;
                
                console.log ( "index" );
                res.send( "index" );
                } );
        
        // connection.end();
        });

app.get( '/users/login', function (req, res) {
        var target_id = req.query["id"];
        var target_pw = req.query["pw"];
        console.log("param: ", req.query["id"]);
        
        connection.query( "SELECT * FROM users WHERE id='" + target_id + "'", function (err, data, fields) {
            var result = {"result": ""}; 
            console.log(data);
            console.log("ID: ", data[0]["id"]);
            console.log("PW: ", data[0]["password"])
            if ( err ) throw err;
            else
            {
                var result = {"result": ""};
                if ( data.length == 0 )
                {
                    result["result"] = "fail";
                    result["msg"] = "Cannot find ID.";
                }
                else if ( data[0]["password"] != target_pw )
                {
                    result["result"] = "fail";
                    result["msg"] = "Wrong Password.";
                }
                else
                {
                    result["result"] = "success";
                    result["msg"] = ""; // Data for Login Activity.
                }
            }

            console.log ( result );
            res.json( result );

        } );
});

app.get( '/users/register', function (req, res) {
        var target_id = req.query.id;
        var target_pw = req.query.pw;
        var result = {"result": ""};

        var inst = "SELECT id FROM users WHERE id = '" + target_id + "'";

        connection.query( inst, function (err, data, fields) {
            if ( err ) throw err;
            
            is_inserted = data.length;
            if (is_inserted > 0)
            {
                result["result"] = "fail";
                result["msg"] = "Already Registered with this ID";
                res.json( result );
            }
            else
            {
                inst = "INSERT INTO users(id, password) VALUES ('" + target_id+ "', '" + target_pw + "')";
                connection.query( inst, function (err, data, fields) {
                    if ( err ) throw err;

                result["result"] = "success";
                result["msg"] = "Successfully Inserted.";
                res.json( result );
                } );

            }
                
        } );
} );


app.get('/stores', function (req, res){
        var target_category = req.query.category;
        var result = {"result": ""};

        var inst = "SELECT * FROM stores"
        
        if ( target_category != null )
            inst += " WHERE category='" + target_category + "'";
       

        console.log( inst );
        connection.query( inst, function (err, data,fields) {
               result["result"] = "success";
               result["msg"] = data;
               res.json( result );
                } );

        });

app.get('/stores/location', function (req, res){
        var target_store = req.query.name;
        var result = {"result": ""};

        var inst = "SELECT lat, lng FROM stores WHERE name='" + target_store + "'";

        connection.query( inst, function (err, data, fields) {
                if (data.length < 1)
                {
                    result["result"] = "fail";
                    result["msg"] = "Cannot Find This store."
                }
                else
                {
                    result["result"] = "success";
                    result["msg"] = data[0];
                    }
                res.json( result );
                });

        });

app.post( '/reserve', function(req, res){
        var targ_store = req.body.store;
        var amount = parseInt(req.body.amount);
        var targ_token = req.body.token;
        var remain_inst = "SELECT remain, seat FROM stores WHERE name='" + targ_store + "'";
        var reserve_inst = "UPDATE stores SET reserve = JSON_array_APPEND ( reserve, '$', JSON_OBJECT(" + "'amount',"  + amount + ','
        + "'token', '" +  targ_token +  "') ) WHERE name='" + targ_store + "'";
        
        connection.query( remain_inst, function (err, data, fields) {
                if ( err ) throw err;

                if (data[0]['remain'] - amount >= 0)
                {
                    console.log('FCM');

                    connection.query( "UPDATE stores SET remain=" + (data[0]['remain']-amount) + " WHERE name='" + targ_store + "'",
                            function(err, data, fields){
                                console.log(err);
                            });

                    var message = {
                        token: targ_token,
                        notification: {
                            title: "가게로 가면 됩니당",
                            body: "가게가 텅텅"
                        },
                        data: {
                            title: "가게로 가영",
                            msg: "가게가 텅텅"
                        }
                    }
                    admin.messaging().send(message)
                        .then(function(httpRes){
                                console.log("Successfully Message Sended");
                                res.json( JSON.parse( '{"result": "success", "msg": "Messaging to You."}' ) );
                                })
                        .catch(function(err){
                                console.log("Err: " + err);
                                res.json( JSON.parse( '{"result": "fail", "msg": "' + err + '"}' ) );
                                });
                }
                else
                {
                    console.log('reserve');
                    connection.query( reserve_inst, function(err, data, fields){
                            res.json( JSON.parse( '{"result": "success", "msg": "Reserved."}' ) );       
                    });
                }

        } );
});

app.get('/stores/images', function(req, res){
        var targ_img = urlencode.decode( req.query.name );
        console.log( targ_img );
        res.send( '<br><img src="/' + targ_img + '.jpg"/>' );
        });




app.listen(3000, function () {
        console.log( 'port 3000 test' );
        });

