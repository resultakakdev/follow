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
		for(var i = 0; i < headers.length; i++){
			let header = headers[i]
			if(header.name.toLowerCase() == 'x-requested-with') {
				shouldInject = false
			}
		}
	}
	if(shouldInject){
		headers.push({
			name: 'x-ig-capabilities',
			value: '3w=='
		})
		for(var i = 0; i < headers.length; i++){
			let header = headers[i]
			if(header.name.toLowercase() == 'referer'){
				if(header.value != 'https://www.instagram.com'){
					shouldInject = false
				}
			}
			if (header.name.toLowerCase() == 'user-agent' && shouldInject) { 
            	header.value = 'Instagram 10.3.2 (iPhone7,2; iPhone OS 9_3_3; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+'
          	}
          	if (header.name.toLowerCase() == 'cookie' && shouldInject) { 
            	// add auth cookies to authenticate API requests
            	var cookies = header.value;
            	cookies = "ds_user_id=" + userCookies.ds_user_id + "; sessionid=" + userCookies.sessionid + "; csrftoken=" + userCookies.csrftoken + ";"
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