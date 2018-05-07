var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var app = express();
var path = require('path');
var yelp = require('yelp-fusion');
var apiKey = 'cEq5vLzjdXhziwMEWbJYMU79-RWjO3uaorXi94MhhQBV2RjPzeMFhVUCDjywnIPXoXKTzxTdM1bUZ4YuznDmlP8-go2Z20PfndoTiHTTNswovl6tVysIoaH_WsLCWnYx';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
  
});

app.get('/process/yelp', function(req,res){
	console.log("Server side yelp is done!");
	console.log(req.query);
	var client = yelp.client(apiKey);

	var tmp = req.query.address;
	var arr = tmp.split(",");


	var a0 = arr[0];
	var a1 = arr[1].substring(1);
	var a2 = arr[2];
	var a3 = arr[3].substring(1,3);
	var ap = arr[2].substring(1,3);
	console.log("name: " + req.query.name);
	console.log("address1: " + arr[0]);
	console.log("address2: " + arr[1].substring(1)+","+arr[2]);
	console.log("city: " + arr[1].substring(1));
	console.log("state: " + arr[2].substring(1,3));

	client.businessMatch('best', {
		 name: req.query.name,
		 address1: a0,
		 address2: a1+","+a2,
		 city: a1,
		 state: ap,
		 country: a3	 
		}).then(response => {
		  console.log(response.jsonBody);

		  client.reviews(response.jsonBody.businesses[0].id).then(response => {
		  	console.log("yelp reviews:");
			  console.log(response.jsonBody.reviews);
			  res.send(response.jsonBody.reviews);
			}).catch(e => {
			  console.log(e);
			});

		}).catch(e => {
		  console.log(e);
		});
});

app.get('/process', function(req,res){
	
	function getLocation(){
		url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
   			 +"location="+lat+","+lon+"&radius="+distance+"&type="+req.query.category+"&keyword="+req.query.keyword
   			 +"&key=AIzaSyDhSrGlH0RRfnzfwml0LAEtLrd3CLaWnSo";
   		console.log(url);
   		request(url, function(error, response, body){
   			if(!error && response.statusCode == 200) {
   				obj = JSON.parse(body);
   				obj.lat = lat;
   				obj.lon = lon;
   				res.send(JSON.stringify(obj));
   			} else {
   				console.log("Error in Google Nearby Search");
   			}
   		});
	}

	//console.log(req.query);

	var distance;
	var url;
	var lat;
	var lon;
	//use google api
	distance = req.query.distance*1609.34;
	//console.log("req.query.state",req.query.state);

	if(req.query.state=='true'){
		url = 'http://ip-api.com/json';
		request(url, function(error,response, body) {
			if(!error && response.statusCode == 200){
				var obj = JSON.parse(body);
				lat = obj.lat;
				lon = obj.lon;
				getLocation();
			} else {
				console.log("Error in ip-api.com");
			}
		});
	} else {
		url = "https://maps.googleapis.com/maps/api/geocode/json?address="+req.query.location+"&key=AIzaSyDhSrGlH0RRfnzfwml0LAEtLrd3CLaWnSo";
		request(url, function(error,response, body) {
			if(!error && response.statusCode == 200){
				var obj = JSON.parse(body);
				lat = obj.results[0].geometry.location.lat;
				lon = obj.results[0].geometry.location.lng;
				getLocation();
			} else {
				console.log("Error in Google api");
			}
		});
	}
		
	});

app.get('/process/next',function(req,res){
	//console.log("Hi~~~~");
	//console.log(req.query);
	var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+req.query.next+"&key=AIzaSyDhSrGlH0RRfnzfwml0LAEtLrd3CLaWnSo";

	request(url, function(error, response, body){
   			if(!error && response.statusCode == 200) {
   				res.send(body);
   			} else {
   				console.log("Error in Google Next Search");
   			}
   		});
});



var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});


