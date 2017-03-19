let userCookies = {}

loadCookies()

/* get the username from the url of the current tab => https://www.instagram.com/james/ will return james */
function getUsernameFromURL(url) {
	return url.split('/')[3]
}

function loadCookies() {
	getCookies( (cookies) => {
		userCookies = cookies
	})
}

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
		let currentTabURL = tabs[0].url
		username = getUsernameFromURL(currentTabURL)
		chrome.tabs.sendMessage(tabs[0].id, {instagramCookies: JSON.stringify(cookie), user: JSON.stringify(username)})
	})
}

chrome.runtime.onMessage.addListener( (request, sender, response) => {
	if(request === 'getCookies') {
		console.log('here')
		getCookies( (userCookie) => {
			userCookies = userCookie
			sendCookies(userCookie)
		})
	}
})

// chrome.tabs.onUpdated.addListener( (tabID, change, tab) => {
// 	if(change.status == 'complete' && tab.active) {
// 		sendCookies(userCookies)
// 	}
// })

/* modify header before sending request */
chrome.webRequest.onBeforeSendHeaders.addListener( (info) => {
	let headers = info.requestHeaders
	let shouldInject = true
	if(!userCookies.ds_user_id && !userCookies.sessionID) {
		shouldInject = false
	}
	if(shouldInject){
		for(var i = 0; i < headers.length; i++){
			let header = headers[i]
			if(header.name.toLowerCase() == 'x-requested-with') {
				shouldInject = false
			}
		}
	}
	if(shouldInject){
		// headers.push({
		// 	name: 'x-ig-capabilities',
		// 	value: '3w=='
		// })
		for(var i = 0; i < headers.length; i++){
			let header = headers[i]
			if(header.name.toLowerCase() == 'referer'){
				// if(header.value != 'https://www.instagram.com'){
				// 	shouldInject = false
				// }
				if(!header.value.includes('instagram')){
					shouldInject = false
				}
			}
          	if (header.name.toLowerCase() == 'user-agent' && shouldInject) { 
            	header.value = 'Instagram 10.3.2 (iPhone7,2; iPhone OS 9_3_3; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+'
          	}
          	if (header.name.toLowerCase() == 'cookie' && shouldInject) { 
            	// add auth cookies to authenticate API requests
            	let cookies = header.value;
            	cookies = "ds_user_id=" + userCookies.ds_user_id + "; sessionid=" + userCookies.sessionID + "; csrftoken=" + userCookies.csrftoken + ";"
            	// + cookies
            	header.value = cookies;
          	}
		}
	}
	return {requestHeaders: headers};
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