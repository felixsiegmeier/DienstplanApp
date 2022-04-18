const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const ejs = require("ejs")
const schemas = require(__dirname+"/schemas.js")
const https = require("https")

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

////////////////////////////////////////////// main Page //////////////////////////////////////////////
app.get("/", (req, res) => {
	res.render("index")
})

////////////////////////////////////////////// overview of all plans //////////////////////////////////////////////
app.get("/all", (req, res) => {
	res.render("allplans")
})

////////////////////////////////////////////// grid of a single plan //////////////////////////////////////////////
app.get("/plan/:id", (req, res) => {
	const id = req.params.id
	// insert function to lead propper plan from DB
	res.render("plan", {plan: id})
})

////////////////////////////////////////////// doctors-list for creation and editing doctors and their parameters //////////////////////////////////////////////
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

////////////////////////////////////////////// All about all plans - creation, selection //////////////////////////////////////////////

function holidays(year, month){
	return new Promise((resolve, reject) =>{
		const holidayList = []
	https.get("https://feiertage-api.de/api/?jahr="+year+"&nur_land=MV", (res) =>{
		res.on("data", (d) => {
			const jsonFormat = JSON.parse(d)
			const keys = Object.keys(jsonFormat)
			keys.forEach(key => {
				const arrayFormat = jsonFormat[key].datum.split("-").map(Number)
				holidayList.push(arrayFormat)
			})
			const monthlyHolidays = []
			holidayList.forEach(holiday => {
				if (holiday[1] === month){
					monthlyHolidays.push(holiday[2])
				}
			})
			resolve(monthlyHolidays)
		})
	})
	})
}

function getDaysInMonth(month, year) {
  var date = new Date(year, month, 1);
  var days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

app.get("/plans", (req, res) => {
	Plan.find((err, finding)=> {
		res.render("plans", {plans: finding})
	})
	
})

app.post("/plans", (req, res) => {
	const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
	const newPlan = new Plan({
		name: req.body.name,
		year: req.body.year,
		month: (months.indexOf(req.body.month)+1)
	})
	const allDays = getDaysInMonth(newPlan.month-1, newPlan.year)

	holidays(newPlan.year, newPlan.month)
	.then((holidays) => {
		allDays.forEach(day => {
			const newDay = new Day({
				date: day
			})
			// Sa, So
			if([6,0].includes(day.getDay())){
				newDay.noWorkingDay = true
				newDay.pointValue += 1
			}
			// Fr
			if(day.getDay() === 5){
				newDay.pointValue += 1
			}
			// Holiday
			if(holidays.includes(day.getDate())){
				newDay.noWorkingDay = true
				newDay.pointValue += 1
			}
			// 31.12.
			if((newPlan.month === 12) & (day.getDate() === 31)){
				newDay.pointValue += 1
			}
			// 30.04.
			if((newPlan.month === 4) & (day.getDate() === 30)){
				newDay.pointValue += 1
			}
			// Samstag
			if(day.getDay() === 6){
				newDay.pointValue += 1
			}
			// Folgetag ist Feiertag
			if (holidays.includes(day.getDate()+1)){
				newDay.pointValue += 1
			}
			// 3 is maximum
			if (newDay.pointValue > 3){
				newDay.pointValue = 3
			}
			newPlan.days.push(newDay)
		})
		newPlan.save(() => {
			res.redirect("/plan/"+newPlan._id)
		})
	})
})

app.delete("/plans",(req, res) => {
	Plan.deleteOne({_id: req.query.id}, (q) => {
		res.send(200)
	})
})

















app.listen(3000, () => {
	console.log("Server up and running")
})