$(".card").on("click", (e) => {
	name = $(e.currentTarget).attr("name");
	window.open("/"+name, "_self");
})

$(".btn-new-doctor").on("click", () => {
	window.open("/doctors/new", "_self");
})

$(".bi-trash3-fill").on("click", (e) => {
	const id = $(e.currentTarget).attr("value")
	console.log(id)
	$.ajax({
		url: "/doctors?id="+id,
		type: "DELETE",
		success: () => {
			window.open("/doctors", "_self")
		}
	})
})

$(".bi-house-fill").on("click", () => {
	console.log("clicked")
	window.open("/", "_self")
})