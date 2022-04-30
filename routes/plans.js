const express = require("express")
const router = express.Router()
const {plansView, createPlan, deletePlan} = require("../controllers/planscontroller")

router.get("/", plansView)
router.post("/", createPlan)
router.delete("/", deletePlan)

module.exports = router