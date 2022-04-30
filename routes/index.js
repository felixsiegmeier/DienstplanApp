const express = require("express")
const {indexView} = require("../controllers/indexController")
const router = express.Router()

router.get("/", indexView)

module.exports = router