$(".card").on("click", (e) => {
	name = $(e.currentTarget).attr("name");
	window.open("/"+name);
})