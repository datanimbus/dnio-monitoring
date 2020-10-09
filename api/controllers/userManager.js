let e = {};
const mongoose = require('mongoose');
// const client = require('../../util/queueMgmt').client;

const fetData = require('../../util/fetchData');
let logger = global.logger;

e.log = function (req, res) {
	let colName = 'user.logs';
	fetData.index(req, res, colName);
};
e.logCount = function (req, res) {
	let colName = 'user.logs';
	fetData.count(req, res, colName);
};

e.userDomainAudit = function (req, res) {
	let colName = 'userMgmt.apps.audit';
	fetData.index(req, res, colName);
};
e.userDomainAuditCount = function (req, res) {
	let colName = 'userMgmt.apps.audit';
	fetData.count(req, res, colName);
};

e.userRoleAudit = function (req, res) {
	let colName = 'userMgmt.roles.audit';
	fetData.index(req, res, colName);
};
e.userRoleAuditCount = function (req, res) {
	let colName = 'userMgmt.roles.audit';
	fetData.count(req, res, colName);
};

e.userAudit = function (req, res) {
	let colName = 'userMgmt.users.audit';
	fetData.index(req, res, colName);
};
e.userAuditCount = function (req, res) {
	let colName = 'userMgmt.users.audit';
	fetData.count(req, res, colName);
};

e.readiness = function (req, res) {
	return res.status(200).json();
};



e.health = function (req, res) {
	let client = global.client;
	if (mongoose.connection.readyState === 1 && client && client.nc && client.nc.connected) {
		return res.status(200).json();
	}
	else {
		logger.debug('Mongoose ready state:: ', mongoose.connection.readyState);
		if(client && client.nc && client.nc.connected) 
			logger.debug('nats client.nc.conected info : ', client && client.nc && client.nc.connected);
		else if(client && client.nc)
			logger.debug('nats client.nc info : ', client && client.nc);
		else 
			logger.debug('nats client info : ', client);
		return res.status(400).json();
	}
};

module.exports = e;