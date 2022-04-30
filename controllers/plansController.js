const Clinic = require("../models/clinic")
const Plan = require("../models/plan")
const Day = require("../models/day")
const getHolidays = require("../models/holidays")
const getDaysInMonth = require("../models/daysinmonth")


const plansView = async (req, res) => {
	plans = await Plan.find()
	res.render("plans", {plans: plans})
	}

const createPlan = async (req, res) => { //creates a new Plan in DB and redirects to it's page
	const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
	const newPlan = new Plan({
		name: req.body.name,
		year: req.body.year,
		month: (months.indexOf(req.body.month)+1)
	})
	const allDays = await getDaysInMonth(newPlan.month, newPlan.year)

	const holidays = await getHolidays(newPlan.year, newPlan.month)
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
		newDay.clinics = new Clinic()
		newPlan.days.push(newDay)
	})
	newPlan.save(() => {
		res.redirect("/plan?id="+newPlan._id)
	})
}

const deletePlan = (req, res) => {
	Plan.deleteOne({_id: req.query.id}, (q) => {
		res.sendStatus(200)
	})
}


module.exports = {
	plansView,
	createPlan,
	deletePlan
}