class InstagramAPI {

	constructor() {
		this.baseURL = 'https://i.instagram.com/api/v1/'
	}

	getIDFromUsername(username, callback) {
		let url = 'https://www.instagram.com/' + username + '/?__a=1'
		return fetch(url, {
			accept: 'application/json',
    		credentials: 'include'
		})
		.then( (response) => {
			return response.json()
		})
		.then( (json) => {
			return json['user']['id']
		})
		.then(callback)
	}

	getUserInfo(userID, callback) {

	}
}