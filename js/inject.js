



// document.addEventListener('DOMContentLoaded', () => {
// 	/* adds follow div to current page */
// 	let head = document.getElementsByClassName('_8mm5v')[0]
// 	console.log(head)
// 	let div = document.createElement('div')
// 	head.insertBefore(div, head.children[1])
// 	div.innerHTML = "testing hello"
// })


	// let div = document.createElement('div')
	// document.body.appendChild(div)
	// div.innerHTML = cookie


// tell background.js to fetch Instagram cookies
function sendCookieRequest() {
	chrome.runtime.sendMessage('getCookies')
}

function injectFollowingStatusLabel() {
	let head = document.getElementsByClassName('_8mm5v')[0]
	let followingStatusLabel = document.createElement('div')
	followingStatusLabel.setAttribute('id', 'followingStatusLabel')
	head.insertBefore(followingStatusLabel, head.children[1])
	followingStatusLabel.innerHTML = 'testing again'
}

sendCookieRequest()
injectFollowingStatusLabel()

// wait for background.js to send over cookies
chrome.runtime.onMessage.addListener( (request, sender, response) => {
	let instagramCookies = JSON.parse(request.instagramCookies)
	console.log(instagramCookies)
	let div = document.createElement('div')
	document.body.appendChild(div)
	div.innerHTML = instagramCookies
})