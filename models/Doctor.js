const mongoose = require("mongoose")

const DoctorSchema = new mongoose.Schema({
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

const Doctor = mongoose.model("Doctor", DoctorSchema)
module.exports = Doctor