let e = {};
let config = require('../config/config');
let serviceUtils = require('./serviceUtils');
const logger = global.logger;
logger.trace(JSON.stringify(config.streamingConfig));
let mongoose = require('mongoose');
var client = global.client;

client.on('connect', function () {
	dataServiceLogger();
	systemServiceLogger();
	prehookCreate();
	audit();
	posthookCreate();
	posthookUpdate();
	auditRemove();
	interactionsLogger();
	userInsight();
	groupInsight();
	agentLogger();
	logEvents();
	logFunctionsConsole();
});

client.on('reconnect', function () {
	logger.info('NATS reconnected');
	dataServiceLogger();
	systemServiceLogger();
	prehookCreate();
	audit();
	posthookCreate();
	posthookUpdate();
	auditRemove();
	interactionsLogger();
	userInsight();
	groupInsight();
	agentLogger();
	logEvents();
	logFunctionsConsole();
});

client.on('error', err => {
	logger.error(err.message);
});

client.on('disconnect', function () {
	logger.info('disconnect');
});

client.on('reconnecting', function () {
	logger.info('reconnecting');
});

client.on('close', function () {
	logger.info('close');
});

(async function () {
	const calcSeconds = 24 * 60 * 60 * config.API_LOGS_TTL_DAYS;
	const calcSecondsFaas = 24 * 60 * 60 * config.FAAS_LOGS_TTL_DAYS;
	logger.info('TTL for logs is set to :', calcSeconds);
	let indexObject = {
		key: { '_metadata.createdAt': 1 },
		options: { expireAfterSeconds: calcSeconds, name: 'AUTO_EXPIRE' }
	};
	try {
		await config.indexUtil(mongoose, 'dataService.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for dataService.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'pm.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for pm.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'sec.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for sec.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'gw.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for gw.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'dm.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for dm.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'mon.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for mon.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'sm.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for sm.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'user.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for user.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'wf.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for wf.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'ne.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for ne.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'event.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for event.logs');
		logger.error(err.message);
	}
	try {
		await config.indexUtil(mongoose, 'deploymentManager.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for deploymentManager.logs');
		logger.error(err.message);
	}
	try {
		indexObject.options.expireAfterSeconds = calcSecondsFaas;
		await config.indexUtil(mongoose, 'faas.console.logs', indexObject);
	} catch (err) {
		logger.error('Error while creating TTL index for faas.console.logs');
		logger.error(err.message);
	}
})();

function dataServiceLogger() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('data-service-durable');
	var subscription = client.subscribe(config.queueNames.dataService, 'data.service', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.dataService} :: ${JSON.stringify(bodyObj)}`);
		// let colName = bodyObj.collectionName;
		let colName = 'dataService.logs';
		const payload = bodyObj.data;
		let mongoDBColl = mongoose.connection.db.collection(colName);
		if (colName && payload) {
			payload.colName = bodyObj.collectionName;
			fixAPILogPayload(payload);
			fixMetaData(payload);
			let promise = Promise.resolve();
			if (!payload.serviceId) {
				promise = serviceUtils.getServiceId(bodyObj.collectionName);
			}
			promise.then(data => {
				if (data && data._id) {
					payload.serviceId = data._id;
				}
				return mongoDBColl.insert(payload)
					.catch(err => {
						logger.error(err);
					});
			}).catch(err => {
				logger.error(err);
			});
		}
	});
}

function systemServiceLogger() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('system-service-durable');
	var subscription = client.subscribe(config.queueNames.systemService, 'system.service', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.systemService} :: ${JSON.stringify(bodyObj)}`);
		if (bodyObj.collectionName && bodyObj.data) {
			fixMetaData(bodyObj.data);
			let mongoDBColl = mongoose.connection.db.collection(bodyObj.collectionName);
			mongoDBColl.insert(bodyObj.data);
		}
	});
}

function prehookCreate() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('prehook-durable');
	var subscription = client.subscribe(config.queueNames.prehookCreate, 'prehook.create', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.prehookCreate} :: ${JSON.stringify(bodyObj)}`);
		// let colName = bodyObj.colName;
		let colName = 'dataService.logs';
		fixPreHookPayload(bodyObj);
		fixMetaData(bodyObj);
		bodyObj._metadata.deleted = false;
		if (colName && bodyObj.data) {
			let mongoDBColl = mongoose.connection.db.collection(colName);
			mongoDBColl.insert(bodyObj);
		}
	});
}

function audit() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('audit-durable');
	var subscription = client.subscribe(config.queueNames.auditQueue, 'audit.create', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.auditQueue} :: ${JSON.stringify(bodyObj)}`);
		bodyObj.timeStamp = new Date();
		fixMetaData(bodyObj);
		let colName = bodyObj.colName;
		if (colName && bodyObj.data) {
			let mongoDBColl = mongoose.connection.db.collection(colName);
			mongoDBColl.insert(bodyObj);
		}
	});
}

function logEvents() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('event-logs');
	var subscription = client.subscribe(config.queueNames.logEvents, 'event.logs', opts);
	let mongoDBColl = mongoose.connection.db.collection('event.logs');
	let indexObject = {
		key: { '_metadata.createdAt': 1, 'scheduleTime': 1, 'data.eventId': 1, 'status': 1, 'data.source': 1 },
		options: { name: 'EVENT_LOG_INDEX' }
	};
	try {
		config.indexUtil(mongoose, 'event.logs', indexObject);
	} catch (e) {
		logger.error('Error creating EVENT_LOG_INDEX for event.log');
		logger.error(e.message);
	}
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.logEvents} :: ${JSON.stringify(bodyObj)}`);
		if (bodyObj.scheduleTime) {
			bodyObj.scheduleTime = new Date(bodyObj.scheduleTime);
		}
		if (bodyObj.data && bodyObj.data.timestamp) {
			bodyObj.data.timestamp = new Date(bodyObj.data.timestamp);
		}
		fixMetaData(bodyObj);
		if (bodyObj) {
			mongoDBColl.insert(bodyObj);
		}
	});
}

function posthookCreate() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('posthook-create-durable');
	var subscription = client.subscribe(config.queueNames.posthookCreate, 'posthook.create', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.posthookCreate} :: ${JSON.stringify(bodyObj)}`);
		// let colName = bodyObj.colName;
		let colName = 'dataService.logs';
		fixPostHookPayload(bodyObj);
		fixMetaData(bodyObj);
		bodyObj._metadata.deleted = false;
		if (colName && bodyObj.data) {
			let mongoDBColl = mongoose.connection.db.collection(colName);
			mongoDBColl.insert(bodyObj);
		}
	});
}

function posthookUpdate() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('posthook-update-durable');
	var subscription = client.subscribe(config.queueNames.posthookUpdate, 'posthook.update', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		fixPostHookPayload(bodyObj);
		fixMetaData(bodyObj);
		logger.trace(`Message from queue :: ${config.queueNames.posthookUpdate} :: ${JSON.stringify(bodyObj)}`);
		// let colName = bodyObj.colName;
		let colName = 'dataService.logs';
		if (bodyObj) {
			return mongoose.connection.db.collection(colName).update({ uuid: bodyObj.uuid }, { $set: bodyObj });
		}
	});
}

function auditRemove() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('audit-remove-durable');
	var subscription = client.subscribe(config.queueNames.auditQueueRemove, 'audit.remove', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		logger.trace(`Message from queue :: ${config.queueNames.auditQueueRemove} :: ${JSON.stringify(bodyObj)}`);
		let colName = bodyObj.colName;
		if (colName) {
			let mongoDBColl = mongoose.connection.db.collection(colName);
			if (bodyObj.versionValue >= 0) {
				mongoDBColl.deleteMany({ 'data._id': bodyObj.data._id, 'data._version': { '$lte': bodyObj.data._version - bodyObj.versionValue } });
			}
			else {
				mongoDBColl.deleteMany({ 'data._id': bodyObj.id });
			}
		}
	});

}

function interactionsLogger() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('interaction-logs-durable');
	var subscription = client.subscribe(config.queueNames.interactionLogs, 'interaction.logs', opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		fixMetaData(bodyObj);
		logger.trace(`Message from queue :: ${config.queueNames.interactionLogs} :: ${JSON.stringify(bodyObj)}`);
		if (bodyObj && bodyObj.app) {
			let mongoDBColl = mongoose.connection.db.collection(bodyObj.app + '.interaction.logs');
			mongoDBColl.insert(bodyObj);
		}
	});
}



function userInsight() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('user-insight-logs-durable');
	var subscription = client.subscribe(config.queueNames.userInsight, opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		bodyObj.timestamp = new Date();
		fixMetaData(bodyObj);
		logger.trace(`Message from queue :: ${config.queueNames.userInsight} :: ${JSON.stringify(bodyObj)}`);
		if (bodyObj) {
			let mongoDBColl = mongoose.connection.db.collection('user.logs');
			mongoDBColl.insert(bodyObj);
		}
	});
}

function groupInsight() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('group-insight-logs-durable');
	var subscription = client.subscribe(config.queueNames.groupInsight, opts);
	subscription.on('message', function (_body) {
		let bodyObj = JSON.parse(_body.getData());
		bodyObj.timestamp = new Date();
		fixMetaData(bodyObj);
		logger.trace(`Message from queue :: ${config.queueNames.groupInsight} :: ${JSON.stringify(bodyObj)}`);
		if (bodyObj) {
			let mongoDBColl = mongoose.connection.db.collection('group.logs');
			mongoDBColl.insert(bodyObj);
		}
	});
}

function agentLogger() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('agent-logs-durable');
	let values = [];
	let message = [];
	let msg = null;
	let body = {};
	let rawData = null;
	let collectionName = null;
	let promise = [];
	var subscription = client.subscribe(config.queueNames.agentLogs, opts);
	let indexObject = {
		key: { 'timeStamp': 1 },
		options: { expireAfterSeconds: config.agentLogsttl, name: 'AUTO_EXPIRE' }
	};
	subscription.on('message', function (_body) {
		logger.debug('Message consumed from agentLogs ' + _body);
		let bodyObj = JSON.parse(_body.getData());
		logger.debug('Received data from agentlogs ' + bodyObj);
		var docs = processContent(bodyObj.content);
		docs.forEach(doc => {
			rawData = doc;
			values = doc.split('] [');
			message = doc.split('] ');
			msg = message[4].replace('\n', '');
			body = makeBody(body, values, msg, bodyObj, rawData);
			collectionName = getCollectionName(body);
			logger.trace(`Message from queue :: ${config.queueNames.agentLogs} :: ${JSON.stringify(body)}`);

			if (body && collectionName) {
				delete body._id;
				fixMetaData(body);
				body.timeStamp = body.timeStamp.replace('[', '').split('IST')[0];
				body.timeStamp = new Date(body.timeStamp);
				body._metadata.deleted = false;
				let mongoDBColl = mongoose.connection.db.collection(collectionName);
				promise.push(config.indexUtil(mongoose, collectionName, indexObject));
				promise.push(mongoDBColl.insert(body));
			}
		});
		Promise.all(promise);
	});
}


function logFunctionsConsole() {
	var opts = client.subscriptionOptions();
	opts.setStartWithLastReceived();
	opts.setDurableName('faas-console-logs');
	var subscription = client.subscribe(config.queueNames.faasConsoleLogs, opts);
	let mongoDBColl = mongoose.connection.db.collection('faas.console.logs');
	let indexObject = {
		key: { '_metadata.createdAt': 1, 'context.user': 1, 'context.app': 1, 'context.faasId': 1, 'startTime': 1, 'level.levelStr': 1 },
		options: {
			name: 'FAAS_LOGS_INDEX'
		}
	};
	subscription.on('message', function (_body) {
		const data = _body.getData();
		logger.trace(`Message from queue :: ${config.queueNames.faasConsoleLogs} :: ${data}`);
		let bodyObj = JSON.parse(data);
		if (bodyObj) {
			if (bodyObj.startTime) {
				bodyObj.startTime = new Date(bodyObj.startTime);
			}
			fixMetaData(bodyObj);
			mongoDBColl.insert(bodyObj);
		}
	});
	try {
		config.indexUtil(mongoose, 'faas.console.logs', indexObject);
	} catch (e) {
		logger.error(e);
	}
}

function processContent(data) {
	let datas = [];
	if (data) {
		datas = data.split('\n[');
	}
	return datas;
}

function makeBody(body, values, doc, reqBody, rawData) {
	body.app = reqBody.app;
	body.agentId = reqBody.agentId;
	body.ipAddress = reqBody.ipAddress;
	body.macAddress = reqBody.macAddress;
	body.logLevel = values[1];
	body.timeStamp = values[0];
	body.content = doc;
	body.agentType = reqBody.agentType;
	body.agentName = reqBody.agentName;
	body.rawData = rawData;
	return body;
}

function getCollectionName(data) {
	if (data.agentType == 'IEG') {
		return 'EdgeGatewayAgentLogs';
	}
	else if (data.agentType == 'IG') {
		return 'GatewayAgentLogs';
	}
	else if (data.agentType == 'PARTNERAGENT') {
		return data.app + '.agentLogs';
	}
	else if (data.agentType == 'APPAGENT') {
		return data.app + '.agentLogs';
	}
}

function fixPreHookPayload(payload) {
	payload.logType = 'preHook';
	if (!payload.app && payload.colName) {
		payload.app = payload.colName.split('.')[0];
	}
	delete payload.colName;
	payload.serviceId = payload.service;
	delete payload.service;
	payload.statusCode = payload.resStatusCode;
	if (payload.status == 'Completed') {
		payload.statusCode = 200;
	} else {
		payload.statusCode = 400;
	}
	delete payload.resStatusCode;
}

function fixPostHookPayload(payload) {
	payload.logType = 'postHook';
	if (!payload.app && payload.colName) {
		payload.app = payload.colName.split('.')[0];
	}
	delete payload.colName;
	if (payload.data && typeof payload.data == 'string') {
		payload.data = JSON.parse(payload.data);
	}
	if (!payload.serviceId && payload.data && payload.data.serviceId) {
		payload.serviceId = payload.data.serviceId;
		delete payload.data.serviceId;
	} else if (!payload.serviceId && payload.entity) {
		payload.serviceId = payload.entity;
		delete payload.entity;
	}
	if (payload.data) {
		payload.docId = payload.data._id;
		if (payload.data.documentId) {
			payload.docId = payload.data.documentId;
			delete payload.data.documentId;
		}
		delete payload.data._id;
		payload.operation = payload.data.operation;
		delete payload.data.operation;
		payload.userId = payload.data.user;
		delete payload.data.user;
		payload.txnId = payload.data.txnId;
		delete payload.data.txnId;
		payload.timestamp = payload.data.timeStamp;
		delete payload.data.timeStamp;
		payload.data.new = payload.data.data.new;
		payload.data.old = payload.data.data.old;
		payload.webHookType = payload.data.webHookType;
		const statusMap = {
			Pending: 'submitHook',
			Approved: 'approveHook',
			Rejected: 'rejectHook',
			Discarded: 'discardHook',
			Rework: 'reworkHook'
		};
		if (!payload.webHookType && payload.data.status && statusMap[payload.data.status]) {
			payload.logType = statusMap[payload.data.status];
			delete payload.data.status;
		}
		delete payload.data.data;
		delete payload.data.app;
		delete payload.data.webHookType;
	}
	delete payload.scheduleTime;
	delete payload.id;
	payload.statusCode = payload.resStatusCode;
	if (payload.status == 'Completed') {
		payload.statusCode = 200;
	} else {
		payload.statusCode = 400;
	}
	delete payload.resStatusCode;
}

function fixAPILogPayload(payload) {
	payload.logType = 'api';
	if (!payload.app && payload.colName) {
		payload.app = payload.colName.split('.')[0];
	}
	if (payload.txnid) {
		payload.txnId = payload.txnid;
		delete payload.txnid;
	}
	delete payload.colName;
	payload.operation = payload.method;
	delete payload.method;
	payload.statusCode = payload.resStatusCode;
	if (payload.statusCode >= 200 && payload.statusCode < 300) {
		payload.status = 'Completed';
	} else {
		payload.status = 'Failed';
	}
	delete payload.resStatusCode;
}

function fixMetaData(data) {
	if (!data._metadata) {
		data._metadata = {};
	}
	if (data._metadata.createdAt) {
		data._metadata.createdAt = new Date(data._metadata.createdAt);
	} else {
		data._metadata.createdAt = new Date();
	}
	if (data._metadata.lastUpdated) {
		data._metadata.lastUpdated = new Date(data._metadata.lastUpdated);
	} else {
		data._metadata.lastUpdated = new Date();
	}
	data._metadata.deleted = false;
}

e.client = client;
module.exports = e;