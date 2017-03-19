function getCookies(callback) {
	let userCookie = {}
	chrome.cookies.get({
		url: 'https://www.instagram.com',
		name: 'ds_user_id'
	}, (cookie) => {
		if(cookie) {
			userCookie.ds_user_id = cookie.value
		}
		chrome.cookies.get({
			url: 'https://www.instagram.com', 
			name: 'sessionid'
		}, (cookie) => {
			if(cookie) { 
				userCookie.sessionID = cookie.value; 
			}
			chrome.cookies.get({
				url: 'https://www.instagram.com', 
				name: 'csrftoken'
			}, (cookie) => {
				if(cookie) { 
					userCookie.csrftoken = cookie.value; 
				}
				if(callback) {
					callback(userCookie);
				}
			});
		});
	})
}

function sendCookies(cookie) {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {instagramCookies: JSON.stringify(cookie)});
	})
}

chrome.runtime.onMessage.addListener( (request, sender, response) => {
	if(request === 'getCookies') {
		console.log('here')
		getCookies( (userCookie) => {
			chrome.extension.getBackgroundPage().console.log(userCookie)
			sendCookies(userCookie)
		})
	}
})