const request = require('./got-request-wrapper');
let config = require('../config/config');

const logger = global.logger;

const serviceMap = {};


function getServiceId(collectionName) {
	if (!collectionName) {
		return Promise.resolve();
	}
	if (!serviceMap[collectionName]) {
		const apiEndpint = collectionName.split('.')[1];
		serviceMap[collectionName] = getData(apiEndpint);
	}
	return serviceMap[collectionName];
}

function getData(apiEndpint) {
	return new Promise((resolve, reject) => {
		request.get(config.baseUrlSM + '/service', {
			qs: {
				filter: JSON.stringify({
					api: apiEndpint
				}),
				count: 1,
				select: '_id'
			}
		}, (err, res, body) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			if (res.statusCode >= 200 && res.statusCode < 300) {
				resolve(body);
			} else {
				reject(body);
			}
		});
	});
}

module.exports.getServiceId = getServiceId;