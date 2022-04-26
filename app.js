const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const ejs = require("ejs")
const schemas = require(__dirname+"/schemas.js")
const planCreation = require(__dirname+"/plancreation.js")
const https = require("https")

app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/dienstplanDB")

const Doctor = mongoose.model("Doctor", schemas.Doctor)
const Day = mongoose.model("Day", schemas.Day)
const Plan = mongoose.model("Plan", schemas.Plan)
const WishList = mongoose.model("WishList", schemas.WishList)
const Wish = mongoose.model("Wish", schemas.Wish)

const doctorAttrs = ["Name", "Klinik", "NFA", "Haus", "IMC", "12 h", "Max", "NA", "RTH"]
const clinics = ["Kardiologie", "Gastroenterologie", "Geriatrie", "Rhythmologie", "Ohne"]
const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]


////////////////////////////////////////////// general functions //////////////////////////////////////////////

function getDaysInMonth(month, year) { // returns an Array of all Days (as Date()-Object) of the month (cave: not month-index!) in year
  var date = new Date(year, month-1, 1);
  var days = [];
  while (date.getMonth() === month-1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function holidays(year, month){ // returns a Promise, resolving an Array of all holidays in germany, MV (as Number) of the month (cave: not month-index!) in year
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

function freeDaysOfMonth(year, month){ // returns a Promise, resolving an Array of all free Days = holidays, satturday, sunday of month (not month-index) in year
	return new Promise((resolve, reject) => {
		const freeDays = []
		const allDays = getDaysInMonth(month, year)
		holidays(year, month)
		.then((holidays) => {
			holidays.map((day) => freeDays.push(day))
			allDays.forEach(day => {
				if ((day.getDay() === 6) || (day.getDay() === 0)){
					freeDays.push(day.getDate())
				}
			})
			resolve(freeDays)
		})
	})
	
}

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
	//CODE
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
	.post((req, res) => { //Save doctors list to DB
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
			res.sendStatus(200)
		})
	})

app.get("/doctors/new", (req, res) => { // Request to create a new "blank" doctor and refresh page to include it in the table (since i don't know a better way to achieve this)
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


app.get("/plans", (req, res) => {
	Plan.find((err, finding)=> {
		res.render("plans", {plans: finding})
	})
	
})

app.post("/plans", (req, res) => { //creates a new Plan in DB and redirects to it's page
	const newPlan = new Plan({
		name: req.body.name,
		year: req.body.year,
		month: (months.indexOf(req.body.month)+1)
	})
	const allDays = getDaysInMonth(newPlan.month, newPlan.year)

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
			res.redirect("/plan?id="+newPlan._id)
		})
	})
})

app.delete("/plans",(req, res) => {
	Plan.deleteOne({_id: req.query.id}, (q) => {
		res.sendStatus(200)
	})
})


////////////////////////////////////////////// WishList = Overview of all Wishes //////////////////////////////////////////////


app.route("/wishlist")
.get((req, res) => {
	WishList.find((err, finding)=> {
		res.render("wishlist", {wishList: finding})
	})
})
.post((req, res) => {
	const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
	const wishList = new WishList({
		name: req.body.name,
		year: req.body.year,
		month: (months.indexOf(req.body.month)+1)
	})
	wishList.save(() => {
		res.redirect("/wish?id="+wishList._id)
	})
})
.delete((req, res) => {
		WishList.deleteOne({_id: req.query.id}, (q) => {
			res.sendStatus(200)
		})
	})

////////////////////////////////////////////// Wish //////////////////////////////////////////////


app.get("/wish",(req, res) => {
	WishList.findOne({_id: req.query.id}, (err, wishList) => {
		if (wishList){
			const wishes = wishList.wishes
			const doctorsWithWishes = wishes.map((wish) => wish.doctorId)
			Doctor.find((err, doctors) => {
				const monthLength = getDaysInMonth(wishList.month, wishList.year).length
				doctors.forEach(doctor => {
					if(!doctorsWithWishes.includes(String(doctor._id))){
						const wish = new Wish({
							doctorId: doctor._id,
							doctorName: doctor.name
						})
						wishList.wishes.push(wish)
					}
				})
			WishList.updateOne({_id: req.query.id}, wishList, (err) => {
				if (!err){
					freeDaysOfMonth(wishList.year, wishList.month)
					.then((freeDays) => {
						res.render("wish", {wishList: wishList, monthLength: monthLength, freeDays: freeDays})
					})
					
				}
			})
				
			})
		}
	})
})

app.post("/wish", (req, res) => {
	wishListId = req.query.id
	wishUpdate = req.body
	WishList.findById(wishListId)
	.then(wishList => {
		const wishes = wishList.wishes
		wishes.forEach(wish => {
			const dutyWishUpdateList = []
			const noDutyWishUpdateList = []

			wishUpdate[wish.doctorId].dutyWish.forEach(update => {
				date = parseInt(update)
				if(date != 0){
					dutyWishUpdateList.push(date)
				}
				wish.dutyWish = dutyWishUpdateList
			})

			wishUpdate[wish.doctorId].noDutyWish.forEach(update => {
				date = parseInt(update)
				if(date != 0){
					noDutyWishUpdateList.push(date)
				}
				wish.noDutyWish = noDutyWishUpdateList
			})
		})
		WishList.findByIdAndUpdate(wishListId, {wishes: wishes}, () => {res.sendStatus(200);})
	})
})

////////////////////////////////////////////// Plan = Single Plan Page //////////////////////////////////////////////

app.get("/plan", (req, res) => {
	Plan.findById(req.query.id)
	.then(plan => {
		Doctor.find()
		.then(doctors => {
				if(plan.wishListId){ // only of there is a wishlish attached to the plan
					WishList.findById(plan.wishListId)
					.then(wishList => {
						WishList.find()
						.then(wishLists => {

							// Object "available" which contains the id and name of the wishlist of the selected plan
							// attributes for each day of the plan will be added later in the code
							const available ={}
							available.name = wishList.name
							available.id = String(wishList._id)

							// vor every day in plan create an Object with lists of the available doctors for that day and duty
							plan.days.forEach(day => {
								dutyDay = {}
								dutyDay.date = day.date.getDate()
								dutyDay.emergencyDepartment = []
								dutyDay.house = []

								doctors.forEach(doctor => {
									if(doctor.emergencyDepartment){
										dutyDay.emergencyDepartment.push([String(doctor._id), doctor.name])
									}
									if(doctor.house){
										dutyDay.house.push([String(doctor._id), doctor.name])
									}
								})

								// If doctors are listed in wishlist for noDutyWish, remove them form the available-list for that day
								wishList.wishes.forEach(wish => {
									if(wish.noDutyWish.includes(dutyDay.date)){

										for(var i = 0; i < dutyDay.emergencyDepartment.length; i++){
											if(dutyDay.emergencyDepartment[i][0] == wish.doctorId){
												dutyDay.emergencyDepartment.splice(i, 1)
											}
										}
										for(var i = 0; i < dutyDay.house.length; i++){
											if(dutyDay.house[i][0] == wish.doctorId){
												dutyDay.house.splice(i, 1)
											}
										}
									}
								})

								// create the attribute of available for the particular day
								available[dutyDay.date] = dutyDay
							})
							res.render("plan", {plan: plan, doctors: doctors, wishLists: wishLists, available: available})
						})
					})
				}else{
					WishList.find()
					.then(wishLists => {
						res.render("plan", {plan: plan, doctors: doctors, wishLists: wishLists, available: false})
					})
				}
			})
		})
	})

app.post("/plan", (req, res) => {
	const update = req.query.update
	const data = req.body

	if(update === "wishList"){
		Plan.findByIdAndUpdate(data.planId, {wishListId: data.wishListId}, () => {
			res.sendStatus(200)
		})
	}

	
})


///////////////////////////////////////////// Testing plan-creation //////////////////////////////////////
// WishList.find((err, wL) => {
// 	Doctor.find((err, docs) => {
// 		Plan.find((err, p) => {
// 			planCreation.generatePlan(p[0], wL[1].wishes, docs)
// 		})
// 	})
// })

app.post("/test", (req, res) => {
	console.log(req.params)
	res.sendStatus(200)
})

////////////////////////////////////////////// Server call //////////////////////////////////////////////

app.listen(3000, () => {
	console.log("Server up and running")
})



