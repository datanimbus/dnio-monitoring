let e = {};
const fetData = require('../../util/fetchData');
// let client = require('../../util/queueMgmt').client;
let config = require('../../config/config');

e.agentLog = function (req, res) {
	let app = req.swagger.params.app.value;
	let colName = app + '.agentLogs';
	fetData.index(req, res, colName);
};
e.agentLogCount = function (req, res) {
	let app = req.swagger.params.app.value;
	let colName = app + '.agentLogs';
	fetData.count(req, res, colName);
};

e.agentLogInsert = function (req, res) {
	let body = {
		app: req['headers']['data-stack-app-name'],
		agentId: req['headers']['data-stack-agent-id'],
		ipAddress: req['headers']['data-stack-ip-address'],
		macAddress: req['headers']['data-stack-mac-address'],
		content: req.body.content,
		agentType: req['headers']['data-stack-agent-type'],
		agentName: req['headers']['data-stack-agent-name']
	};
	global.logger.debug({ qName: config.queueNames.agentLogs, body: JSON.stringify(body) });
	let client = global.client;
	client.publish(config.queueNames.agentLogs, JSON.stringify(body));
	return res.status(200).json(body);
};

e.gatewayAgentLog = function (req, res) {
	let colName = 'GatewayAgentLogs';
	fetData.index(req, res, colName);
};
e.gatewayAgentLogCount = function (req, res) {
	let colName = 'GatewayAgentLogs';
	fetData.count(req, res, colName);
};

e.EdgeGatewayAgentLog = function (req, res) {
	let colName = 'EdgeGatewayAgentLogs';
	fetData.index(req, res, colName);
};
e.EdgeGatewayAgentLogCount = function (req, res) {
	let colName = 'EdgeGatewayAgentLogs';
	fetData.count(req, res, colName);
};

module.exports = e;