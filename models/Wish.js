const mongoose = require("mongoose")

WishSchema = new mongoose.Schema({
	doctorId: String,
	doctorName: String,
	dutyWish: [Number],
	noDutyWish: [Number]
})

const Wish = mongoose.model("Wish", WishSchema)
module.exports = Wish