const Doctor = require("../models/doctor")

const doctorsView = async (req, res) => {
	const doctorAttrs = ["Name", "Klinik", "NFA", "Haus", "IMC", "12 h", "Max", "NA", "RTH"]
	const clinics = ["Kardiologie", "Gastroenterologie", "Geriatrie", "Rhythmologie", "Ohne"]
	const doctors = await Doctor.find()
	res.render("doctors", {doctorAttrs: doctorAttrs, doctors : doctors, clinics: clinics})
}

const updateDoctors = async (req, res) => {
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
}

const deleteDoctor = async (req, res) => {
	Doctor.deleteOne({_id: req.query.id}, (q) => {
		res.sendStatus(200)
	})
}

const newDoctor = (req, res) => {
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
}


module.exports = {
	doctorsView,
	updateDoctors,
	deleteDoctor,
	newDoctor
}