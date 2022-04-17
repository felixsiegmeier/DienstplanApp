const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const ejs = require("ejs")
const schemas = require(__dirname+"/schemas.js")

app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/dienstplanDB")

const Doctor = mongoose.model("Doctor", schemas.Doctor)
const Day = mongoose.model("Day", schemas.Day)
const Plan = mongoose.model("Plan", schemas.Plan)

const doctorAttrs = ["Name", "Klinik", "NFA", "Haus", "IMC", "12 h", "Max", "NA", "RTH"]
const clinics = ["Kardiologie", "Gastroenterologie", "Geriatrie", "Rhythmologie", "Ohne"]

// main Page
app.get("/", (req, res) => {
	res.render("index")
})

// overview of all plans
app.get("/all", (req, res) => {
	res.render("allplans")
})

// grid of a single plan
app.get("/plan/:id", (req, res) => {
	const id = req.params.id
	// insert function to lead propper plan from DB
	res.render("plan", {plan: id})
})

// doctors-list for creation and editing doctors and their parameters
app.route("/doctors")
	.get((req, res) => {
		Doctor.find((err, doctors) => {
			if (!err){
				//console.log(doctors)
				res.render("doctors", {doctorAttrs: doctorAttrs, doctors : doctors, clinics: clinics})
			}else{
				console.log(err)
			}
			
		})
		
	})
	.post((req, res) => {
		const data = req.body
		for (var i = 0; i < data.id.length; i++){
			doctor = {
				_id: data.id[i],
				name: data.name[i],
				maximumDutys: data.maximumDutys[i],
				clinic: data.clinic[i]
			}
			if (data.only12){doctor.only12 = data.only12.includes(data.id[i])}
			if (data.house){doctor.house = data.house.includes(data.id[i])}
			if (data.emergencyDepartment){doctor.emergencyDepartment = data.emergencyDepartment.includes(data.id[i])}
			if (data.imc){doctor.imc = data.imc.includes(data.id[i])}
			if (data.emergencyDoctor){doctor.emergencyDoctor = data.emergencyDoctor.includes(data.id[i])}
			if (data.rescueHelicopter){doctor.rescueHelicopter = data.rescueHelicopter.includes(data.id[i])}

			const run = i	
			Doctor.updateOne({_id: doctor._id}, doctor, (err) => {
				if (!err){
					if (run+1 === data.id.length){res.redirect("/doctors")}
				}else{
					console.log(err)
				}
			})
		}
	})
	.delete((req, res) => {
		console.log(req.query)
		Doctor.deleteOne({_id: req.query.id}, (q) => {
			res.send(200)
		})
	})

app.get("/doctors/new", (req, res) => {
	const doctor = new Doctor({
		name: "",
		clinic: "Ohne",
		only12: false,
		house: true,
		emergencyDepartment: false,
		imc: false,
		emergencyDoctor: false,
		rescueHelicopter: false,
		maximumDutys: 7
	})
	doctor.save((err, ) => {
		res.redirect("/doctors")
	})
})

// All about all plans - creation, selection

app.get("/plans", (req, res) => {
	res.render("plans")
})

app.post("/plans", (req, res) => {
	console.log("got a new plan, need to create the Plan and redirect to its page")
})

app.listen(3000, () => {
	console.log("Server up and running")
})