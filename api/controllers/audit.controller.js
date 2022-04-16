let e = {};

const fetData = require('../../util/fetchData');
const findCollection = require('./findCollection');
const logger = global.logger;
let mongoose = require('mongoose');

e.auditLog = function (req, res) {
	let serviceName = req.params.srvcid;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data + '.audit';
			fetData.index(req, res, data);
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});

};
e.auditLogCount = function (req, res) {
	let serviceName = req.params.srvcid;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data + '.audit';
			fetData.count(req, res, data);
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});

};

e.appcenterAuditPurge = function (req, res) {
	let serviceName = req.params.srvcid;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data + '.audit';
			return mongoose.connection.db.collection(data).remove({});
		})
		.then(() => {
			return res.status(200).json({});
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});
};

e.txnAudit = function (req, res) {
	//let txnId = req.params.txnId;
	findCollection.transactionData(req, res);
};

module.exports = e;