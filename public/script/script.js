// Redirect to corresponding page
$(".card").on("click", (e) => {
	name = $(e.currentTarget).attr("name");
	window.open("/"+name, "_self");
})

// Leads to a get-request in app.js, which creates a new empty "doctor" and redirects to /doctors to reload the page
$(".btn-new-doctor").on("click", () => {
	window.open("/doctors/new", "_self");
})

// Deletes the corresponding doctor, after success redirects to /doctors to refresh page
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

// Deletes the corresponding plan, after success redirects to /plans to refresh page
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

// Deletes the corresponding wishlist, after success redirects to /wishlist to refresh page
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

// Static Home-Button for all Pages
$(".bi-house-fill").on("click", () => {
	console.log("clicked")
	window.open("/", "_self")
})

// Dynamic sear for plans table
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

// dynamic search for wishlist
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

// Redirection for Plan in Plans table
$(".plans-td").on("click", (e) => {
	const id = $(e.currentTarget).parent().attr("value")
	window.open("/plan?id="+id, "_self")
})

// Redirection for Wish in Wishlist table
$(".wishlist-td").on("click", (e) => {
	const id = $(e.currentTarget).parent().attr("value")
	window.open("/wish?id="+id, "_self")
})

// color- and value-change when clicking on a wish-field. (0 = normal, 1 = duty wish, 2 = no duty wish)
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

// saves the entire wish-matrix
$(".btn-save-wish").on("click", (e) => {
	const wishListId = $(e.currentTarget).attr("value")
	const wishMatrix = {}
	$(".wish").each(function(){
		const doctorId = $(this).attr("data-doctor-id")
		const date = $(this).attr("data-date")
		const month = $(this).attr("data-month")
		const year = $(this).attr("data-year")
		const value = $(this).attr("value")
		
		if(!wishMatrix[doctorId]){
			wishMatrix[doctorId] = {}
		}
		if(!wishMatrix[doctorId].dutyWish){
			wishMatrix[doctorId].dutyWish = [0]
		}
		if(!wishMatrix[doctorId].noDutyWish){
			wishMatrix[doctorId].noDutyWish = [0]
		}

		if(value === "1"){
			wishMatrix[doctorId].dutyWish.push(Number(date))
		}
		if(value === "2"){
			wishMatrix[doctorId].noDutyWish.push(Number(date))
		}
	})
	$.ajax({
		type: "POST",
		url: "/wish?id="+wishListId,
		data: wishMatrix,
		dataType: "json"
	})
})

// toggles popover for doctor-selection on plan-page
$(function () {
  $('[data-toggle="popover"]').popover({
    html: true,
    trigger: 'click',
    sanitize: false,
		content: function() {
			return $('#popover-content-'+$(this).attr("data-duty")).html();
		}
	})
})

// changes the wishlist for the selected plan on plan-page via select-menu
$(".plan-wish-select").on("change", (e) => {
	const wishListId = e.currentTarget.value
	const planId = e.currentTarget.getAttribute("data-planId")
	$.ajax({
		url: "/plan?update=wishList",
		data: {wishListId: wishListId, planId: planId},
		type: "POST",
		success: () => {
			window.open("/plan?id="+planId, "_self")
		}
	})
})

// makes the "close"-btn in popover on plan-page close the popover (currently closing all open popups)
$(document).on('click','.popover-btn',function(){
    $('[data-toggle="popover"]').popover("hide")
});

// makes the selection from popover in plan-page be displayed in the plan 
// and the doctors _ids saved as data-doctorid of the containing span
 $(document).on('change', 'select', function() {
    const doctorName = $(this).find(":selected").text()
    const doctorId = $(this).find(":selected").val()
    const duty = $(this).attr("id").split("-")[0] // house || emergencyDepartment
    const position = parseInt($(this).attr("id").split("-")[1]) // 1 || 2
    const date = parseInt($(this).attr("id").split("-")[2]) // 1 ... 31
    targetField = $("[data-duty='"+duty+"-"+date+"']") // e.g. data-duty = "emergencyDepartement-13"
    if(position == 1){
    	targetField.find(":nth-child(1)").text(doctorName)
    	targetField.find(":nth-child(1)").attr("data-doctorid", doctorId)
    }
    if(position == 2){
    	targetField.find(":nth-child(2)").text("/"+doctorName)
    	targetField.find(":nth-child(2)").attr("data-doctorid", doctorId)
    }
  });

// Button to save plan and reload page
 $(".btn-save-plan").on("click", (e) => {
 	const plan = $(e.currentTarget).data("plan-id")
 	const planDays = $(e.currentTarget).data("plan-days")
 	const days = []
 	// hier muss dann für jede Zeile (i=0; i<days; i++) ausgelesen und day {} erzeugt werden
 	for(i=0; i<planDays; i++){
 		const day = {}
 		const emergencyDepartment1 = $('[data-duty="emergencyDepartment-'+(i+1)+'"]').find(':nth-child(1)').data("doctorid")
 		const emergencyDepartment2 = $('[data-duty="emergencyDepartment-'+(i+1)+'"]').find(':nth-child(2)').data("doctorid")
 		day.emergecyDepartment = [emergencyDepartment1, emergencyDepartment2]

 		const house1 = $('[data-duty="house-'+(i+1)+'"]').find(':nth-child(1)').data("doctorid")
 		const house2 = $('[data-duty="house-'+(i+1)+'"]').find(':nth-child(2)').data("doctorid")
 		day.house = [house1, house2]

 		// hier noch die anderen Reihen

 		days.push(day)
 	}
 	console.log(days)
 })


















