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
	window.open("/plan/"+id, "_self")
})

$(".wishlist-td").on("click", (e) => {
	const id = $(e.currentTarget).parent().attr("value")
	window.open("/wish/"+id, "_self")
})

