const mongoose = require("mongoose")

exports.Doctor = Doctor = new mongoose.Schema({
	name: String,
	clinic: String,
	only12: Boolean,
	house: Boolean,
	emergencyDepartment: Boolean,
	imc: Boolean,
	emergencyDoctor: Boolean,
	rescueHelicopter: Boolean,
	maximumDutys: Number
})

exports.Day = Day = new mongoose.Schema({
	date: Date,
	noWorkingDay: {
		type: Boolean,
		default: false},
	pointValue: {
		type: Number,
		default: 1},
	house: [String],
	emergencyDepartment: [String],
	imc: String,
	emergencyDoctor: String,
	rescueHelicopter: String,
})

exports.Plan = Plan = new mongoose.Schema({
	name: String,
	month: Number,
	year: Number,
	days: [Day]
})

exports.Wish = Wish = new mongoose.Schema({
	doctor: String,
	dutyWish: [Date],
	noDutyWish: [Date]
})

exports.Wishes = Wishes = new mongoose.Schema({
	name: String,
	wishes: [Wish]
})