const mongoose = require('mongoose');
const fetData = require('../../util/fetchData');

const logger = global.logger;
let e = {};

e.log = function (req, res) {
	let colName = 'sm.logs';
	fetData.index(req, res, colName);
};
e.logCount = function (req, res) {
	let colName = 'sm.logs';
	fetData.count(req, res, colName);
};

e.globalSchemaAudit = function (req, res) {
	let colName = 'globalSchema.audit';
	fetData.index(req, res, colName);
};
e.globalSchemaAuditCount = function (req, res) {
	let colName = 'globalSchema.audit';
	fetData.count(req, res, colName);
};

e.smAudit = function (req, res) {
	let colName = 'sm.audit';
	fetData.index(req, res, colName);
};

e.smAuditCount = function (req, res) {
	let colName = 'sm.audit';
	fetData.count(req, res, colName);
};

e.authorAuditPurge = function (req, res) {
	let colName = 'sm.audit';
	const serviceId = req.swagger.params.srvcid.value;
	mongoose.connection.db.collection(colName).remove({ 'data._id': serviceId }).then(() => {
		res.status(200).json({});
	}).catch(err => {
		logger.error(err.message);
		res.status(500).send(err.message);
	});
};

module.exports = e;