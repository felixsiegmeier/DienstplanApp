const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname+"/index.html")
})

app.get("/createplan", (req, res) => {
	res.sendFile(__dirname+"/pages/createplan.html")
})

app.get("/allplans", (req, res) => {
	res.sendFile(__dirname+"/pages/allplans.html")
})

app.get("/current", (req, res) => {
	res.sendFile(__dirname+"/pages/current.html")
})








app.listen(process.env.PORT || 3000, () => {
	console.log("App started and listening...")
})