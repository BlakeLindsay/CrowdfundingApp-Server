const imgForm = document.querySelector(".imgForm");

imgForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const file = e.target[0].files[0];
	// fetch to server endpoint to get the link (from s3)
	const url = await fetch("/")
	// fetch to s3 to upload the image (PUT)
	// fetch to our server's db to post the link
})