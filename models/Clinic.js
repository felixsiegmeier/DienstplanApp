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

const Clinic = mongoose.model("Clinic", ClinicSchema)
module.exports = Clinic