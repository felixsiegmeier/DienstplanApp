const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const express = require("express")
const ejs = require("ejs")
const planCreation = require(__dirname+"/plancreation.js")
const https = require("https")

app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

////////////////////////////////////////////// Routes //////////////////////////////////////////////


mongoose.connect("mongodb://localhost:27017/dienstplanDB")

const Doctor = require("./models/doctor")
const Day = require("./models/day")
const Plan = require("./models/plan")
const WishList = require("./models/wishList")
const Wish = require("./models/wish")
const Clinic = require("./models/clinic")

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

function getDoctorClinic(id){
	return new Promise((resolve, reject) => {
		Doctor.findById(id, (err, doctor) => {
			if(doctor){
				clinic = doctor.clinic
				resolve(clinic)
			}
		})
	})
}

////////////////////////////////////////////// main Page //////////////////////////////////////////////

app.use("/", require("./routes/index"))

////////////////////////////////////////////// doctors-list for creation and editing doctors and their parameters //////////////////////////////////////////////

app.use("/doctors", require("./routes/doctors"))

////////////////////////////////////////////// All about all plans - creation, selection //////////////////////////////////////////////

app.use("/plans", require("./routes/plans"))

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

// app.get("/plan", (req, res) => {
// 	Plan.findById(req.query.id)
// 	.then(plan => {
// 		Doctor.find()
// 		.then(doctors => {
// 				if(plan.wishListId){ // only of there is a wishlish attached to the plan
// 					WishList.findById(plan.wishListId)
// 					.then(wishList => {
// 						WishList.find()
// 						.then(wishLists => {

// 							// Object "available" which contains the id and name of the wishlist of the selected plan
// 							// attributes for each day of the plan will be added later in the code
// 							const available ={}
// 							available.name = wishList.name
// 							available.id = String(wishList._id)

// 							// vor every day in plan create an Object with lists of the available doctors for that day and duty
// 							plan.days.forEach(day => {
// 								dutyDay = {}
// 								dutyDay.date = day.date.getDate()
// 								dutyDay.emergencyDepartment = []
// 								dutyDay.house = []

// 								doctors.forEach(doctor => {
// 									if(doctor.emergencyDepartment){
// 										dutyDay.emergencyDepartment.push([String(doctor._id), doctor.name])
// 									}
// 									if(doctor.house){
// 										dutyDay.house.push([String(doctor._id), doctor.name])
// 									}
// 								})

// 								// If doctors are listed in wishlist for noDutyWish, remove them form the available-list for that day
// 								wishList.wishes.forEach(wish => {
// 									if(wish.noDutyWish.includes(dutyDay.date)){

// 										for(var i = 0; i < dutyDay.emergencyDepartment.length; i++){
// 											if(dutyDay.emergencyDepartment[i][0] == wish.doctorId){
// 												dutyDay.emergencyDepartment.splice(i, 1)
// 											}
// 										}
// 										for(var i = 0; i < dutyDay.house.length; i++){
// 											if(dutyDay.house[i][0] == wish.doctorId){
// 												dutyDay.house.splice(i, 1)
// 											}
// 										}
// 									}
// 								})

// 								// create the attribute of available for the particular day
// 								available[dutyDay.date] = dutyDay
// 							})
// 							res.render("plan", {plan: plan, doctors: doctors, wishLists: wishLists, available: available})
// 						})
// 					})
// 				}else{
// 					WishList.find()
// 					.then(wishLists => {
// 						res.render("plan", {plan: plan, doctors: doctors, wishLists: wishLists, available: false})
// 					})
// 				}
// 			})
// 		})
// 	})

// app.post("/plan", (req, res) => {
// 	const update = req.query.update
// 	const data = req.body

// 	if(update === "wishList"){
// 		Plan.findByIdAndUpdate(data.planId, {wishListId: data.wishListId}, () => {
// 			res.sendStatus(200)
// 		})
// 	}

// 	if(update.startsWith("plan")){
// 		const planId = req.body.id
// 		const days = req.body.days
// 		updatePlan(planId, days)
// 		res.sendStatus(200)
// 	}
// })

// async function updatePlan(planId, days){
// 	const updatedPlan = await updatePlanFromPost(planId, days)
// 	console.log(updatedPlan)
// 	//const updatedPlanWithClinics = await updatePlanClinics(updatedPlan)
// }

// async function updatePlanFromPost(planId, days){
// 	const plan = await Plan.findById(planId)
	
// 	if (!plan) return
	
// 	for(i=0; i<days.length; i++){
// 		plan.days[i].emergencyDepartment = days[i].emergencyDepartment
// 		plan.days[i].house = days[i].house
// 		plan.days[i].imc = days[i].imc
// 		getDoctorClinic(days[i].imc)
// 		plan.days[i].emergencyDoctor = days[i].emergencyDoctor
// 		plan.days[i].rescueHelicopter = days[i].rescueHelicopter
// 	}
// 	return plan
// }

// function updatePlanClinics(plan){
// 	return new Promise ((resolve, reject) => {
// 		for (i=0; i<plan.days.length; i++){
// 			console.log(i)
// 			// plan.days[i].clinics.Kardiologie = 0
// 			// plan.days[i].clinics.Gastroenterologie = 0
// 			// plan.days[i].clinics.Rhythmologie = 0
// 			// plan.days[i].clinics.Geriatrie = 0
// 			// plan.days[i].clinics.Ohne = 0
// 			const docs = []
// 			docs.push(plan.days[i].emergencyDepartment[0])
// 			docs.push(plan.days[i].emergencyDepartment[1])
// 			docs.push(plan.days[i].house[0])
// 			docs.push(plan.days[i].house[1])
// 			docs.push(plan.days[i].imc)
// 			docs.push(plan.days[i].emergencyDoctor)
// 			if(i<plan.days.length-1){
// 				docs.push(plan.days[i+1].rescueHelicopter)
// 			}
// 			j = i
// 			for(k=0; k<docs.length; k++){
// 				//console.log(j+" "+k)
// 				l = k
// 				Doctor.findById(docs[k], (err, doc) => {
// 					console.log(l)
// 					if(doc){
// 						const clinic = doc.clinic
// 						plan.days[j].clinics[clinic]++
// 					}
// 					if((j === plan.days.length-1) && (k === docs.length-1)){
// 						console.log("abc")
// 						//resolve(plan)
// 					}
// 				})
// 			}
// 		}
// 	})
// }

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



