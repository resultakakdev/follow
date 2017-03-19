let userCookies = {}

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
			userCookies = userCookie
			// chrome.extension.getBackgroundPage().console.log(userCookie)
			sendCookies(userCookie)
		})
	}
})

/* modify header before sending requst */
chrome.webRequest.onBeforeSendHeaders.addListener( (info) => {
	let headers = info.requestHeaders
	let shouldInject = true
	if(!userCookies.ds_user_id && !userCookies.sessionID) {
		shouldInject = false
	}
	if(shouldInject){
		console.log('clear to change headers')
	}
},{
	urls: [
		"*://*.instagram.com/*"
	],
	types: [
		"xmlhttprequest"
	]
  },
	["blocking", "requestHeaders"]
)