const mongoose = require("mongoose")

WishSchema = new mongoose.Schema({
	doctorId: String,
	doctorName: String,
	dutyWish: [Number],
	noDutyWish: [Number]
})

WishListSchema = new mongoose.Schema({
	name: String,
	month: Number,
	year: Number,
	wishes: [WishSchema]
})

const WishList = mongoose.model("WishList", WishListSchema)
module.exports = WishList