const request = require('request');
let e = {};

e.sendRequest = function (reqObj) {
	var options = {
		url: reqObj.basePath + reqObj.path,
		method: reqObj.method.toUpperCase(),
		headers: reqObj.headers,
		json: true
	};
	if (reqObj.body) {
		options.body = reqObj.body;
	}
	if (reqObj.qs) options.qs = JSON.parse(JSON.stringify(reqObj.qs));
	return new Promise((resolve, reject) => {
		request[reqObj.method.toLowerCase()](options, function (err, res, body) {
			if (err) {
				reject(new Error('Error requesting Service'));
			} else if (!res) {
				reject(new Error('Service Down'));
			} else {
				resolve({status: res.statusCode, body});
			}
		});
	});
};
module.exports = e;