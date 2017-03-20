let InstaAPI = new InstagramAPI()

/* entry */
sendCookieRequest()
// injectFollowingStatusLabel()

// tell background.js to fetch Instagram cookies
function sendCookieRequest() {
	chrome.runtime.sendMessage('getCookies')
}

function injectFollowingStatusLabel(status, booleanStatus) {
	// let head = document.getElementsByClassName('_8mm5v')[0]
	// let followingStatusLabel = document.createElement('h3')
	// followingStatusLabel.setAttribute('id', 'followingStatusLabel')
	// head.insertBefore(followingStatusLabel, head.children[1])
	// followingStatusLabel.innerHTML = status
	let head = document.getElementsByClassName('_de9bg')[0]
	let followingStatusLabel = document.createElement('h3')
	let followingStatusLabelSpan = document.createElement('span')
	followingStatusLabel.setAttribute('id', 'followingStatusLabel')
	followingStatusLabelSpan.setAttribute('id', 'followingStatusLabelSpan')
	// head.insertBefore(followingStatusLabel, head.children[1])
	followingStatusLabel.appendChild(followingStatusLabelSpan)
	head.appendChild(followingStatusLabel)
	followingStatusLabelSpan.innerHTML = status
	booleanStatus ? followingStatusLabelSpan.style.backgroundColor = '#C8E6C9' : followingStatusLabelSpan.style.backgroundColor = '#FF8A80'
}

// wait for background.js to send over cookies
chrome.runtime.onMessage.addListener( (request, sender, response) => {
	let instagramCookies = JSON.parse(request.instagramCookies)
	let username = JSON.parse(request.user)
	InstaAPI.getIDFromUsername(username, (ID) => {
		InstaAPI.getUserFollowingStatus(ID, (status) => {
			console.log(status)
			let isFollowing = status['followed_by']
			isFollowing ? isFollowingString = 'Follows you' : isFollowingString = 'Does not follow you'
			injectFollowingStatusLabel(isFollowingString, isFollowing)
			return
		})
		return
	})
})