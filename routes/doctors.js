const express = require("express")
const {doctorsView, updateDoctors, deleteDoctor, newDoctor} = require("../controllers/doctorsController")
const router = express.Router()

router.get("/", doctorsView)
router.post("/", updateDoctors)
router.delete("/", deleteDoctor)
router.get("/new", newDoctor)

module.exports = router