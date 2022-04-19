$(".card").on("click", (e) => {
	name = $(e.currentTarget).attr("name");
	window.open("/"+name, "_self");
})

$(".btn-new-doctor").on("click", () => {
	window.open("/doctors/new", "_self");
})

$(".del-doctor").on("click", (e) => {
	const id = $(e.currentTarget).attr("value")
	$.ajax({
		url: "/doctors?id="+id,
		type: "DELETE",
		success: () => {
			window.open("/doctors", "_self")
		}
	})
})

$(".del-plan").on("click", (e) => {
	const id = $(e.currentTarget).attr("value")
	$.ajax({
		url: "/plans?id="+id,
		type: "DELETE",
		success: () => {
			window.open("/plans", "_self")
		}
	})
})

$(".del-wish").on("click", (e) => {
	const id = $(e.currentTarget).attr("value")
	$.ajax({
		url: "/wishlist?id="+id,
		type: "DELETE",
		success: () => {
			window.open("/wishlist", "_self")
		}
	})
})


$(".bi-house-fill").on("click", () => {
	console.log("clicked")
	window.open("/", "_self")
})

$(".plans-search").on("keyup", () => {
	const searchTerm = $(".plans-search").val().toLowerCase()
	$(".plans-tr").each(function(){
		const value = $(this).find("td").text().toLowerCase()
		if(value.includes(searchTerm)){
			$(this).removeClass("plans-tr-hidden")
		}else{
			$(this).addClass("plans-tr-hidden")
		}
	})
})

$(".wishlist-search").on("keyup", () => {
	const searchTerm = $(".wishlist-search").val().toLowerCase()
	$(".wishlist-tr").each(function(){
		const value = $(this).find("td").text().toLowerCase()
		if(value.includes(searchTerm)){
			$(this).removeClass("wishlist-tr-hidden")
		}else{
			$(this).addClass("wishlist-tr-hidden")
		}
	})
})

$(".plans-td").on("click", (e) => {
	const id = $(e.currentTarget).parent().attr("value")
	window.open("/plan?id="+id, "_self")
})

$(".wishlist-td").on("click", (e) => {
	const id = $(e.currentTarget).parent().attr("value")
	window.open("/wish?id="+id, "_self")
})

$(".wish").on("click", (e) => {
	const div = $(e.currentTarget)
	switch (div.attr("value")){
		case "0":
			div.addClass("wish-no-duty-wish")
			div.removeClass("wish-normal")
			div.attr("value", "2")
			break
		case "2":
			div.addClass("wish-duty-wish")
			div.removeClass("wish-no-duty-wish")
			div.attr("value", "1")
			break
		case "1":
			div.addClass("wish-normal")
			div.removeClass("wish-duty-wish")
			div.attr("value", "0")
			break
	}
})


$(".btn-save-wish").on("click", () => {
	const wishMatrix = {}
	$(".wish").each(function(){
		const doctorId = $(this).attr("data-doctor-id")
		const date = $(this).attr("data-date")
		const value = $(this).attr("value")
		
		if(!wishMatrix[doctorId]){
			wishMatrix[doctorId] = {}
		}
		if(!wishMatrix[doctorId].dutyWish){
			wishMatrix[doctorId].dutyWish = []
		}
		if(!wishMatrix[doctorId].noDutyWish){
			wishMatrix[doctorId].noDutyWish = []
		}

		if(value === "1"){
			wishMatrix[doctorId].dutyWish.push(Number(date))
		}
		if(value === "2"){
			wishMatrix[doctorId].noDutyWish.push(Number(date))
		}
	})
	console.log(wishMatrix)
})








