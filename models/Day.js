const mongoose = require("mongoose")

const ClinicSchema = new mongoose.Schema({
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

const DaySchema = new mongoose.Schema({
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
	clinics : ClinicSchema
})

const Day = mongoose.model("Day", DaySchema)
module.exports = Day