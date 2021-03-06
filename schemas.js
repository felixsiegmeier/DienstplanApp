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

exports.Clinic = Clinic = new mongoose.Schema({
	Kardiologie: {
		type: Number,
		default: 0
	},
	Gastroenterologie: {
		type: Number,
		default: 0
	},
	Rhythmologie: {
		type: Number,
		default: 0
	},
	Geriatrie: {
		type: Number,
		default: 0
	},
	Ohne: {
		type: Number,
		default: 0
	}
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
	clinics : Clinic
})

exports.Wish = Wish = new mongoose.Schema({
	doctorId: String,
	doctorName: String,
	dutyWish: [Number],
	noDutyWish: [Number]
})

exports.WishList = WishList = new mongoose.Schema({
	name: String,
	month: Number,
	year: Number,
	wishes: [Wish]
})

exports.Plan = Plan = new mongoose.Schema({
	name: String,
	month: Number,
	year: Number,
	wishListId: String,
	days: [Day]
})
