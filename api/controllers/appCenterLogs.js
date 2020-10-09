let e = {};
const fetData = require('../../util/fetchData');
const findCollection = require('./findCollection');
const logger = global.logger;
let mongoose = require('mongoose');

e.appCenterLog = function (req, res) {
	let serviceName = req.swagger.params.id.value;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			if (data) {
				data = data + '.logs';
				fetData.index(req, res, data);
			}
			else {
				res.status(400).json({ message: 'Service not found' });
			}
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});

};
e.appCenterLogCount = function (req, res) {
	let serviceName = req.swagger.params.id.value;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			if (data) {
				data = data + '.logs';
				fetData.count(req, res, data);
			}
			else {
				res.status(400).json({ message: 'Service not found' });
			}
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});

};

e.logPurge = function (req, res) {
	let serviceId = req.swagger.params.srvcid.value;
	return mongoose.connection.db.collection('dataService.logs').remove({ serviceId: serviceId})
		.then(() => {
			logger.debug('Purged logs for ', serviceId);
			return res.status(200).json({});
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});
};
module.exports = e;