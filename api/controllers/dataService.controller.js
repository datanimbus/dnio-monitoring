const fetchData = require('../../util/fetchData');
let logger = global.logger;
let e = {};

e.logs = function (req, res) {
	let txnId = req.get('TxnId');
	let colName = 'dataService.logs';
	logger.info(`[${txnId}] Fetching API access logs for dataservices :: ${colName}`);
	fetchData.index(req, res, colName);
};

e.logsCount = function (req, res) {
	let txnId = req.get('TxnId');
	let colName = 'dataService.logs';
	logger.info(`[${txnId}] Fetching API access logs for dataservices :: ${colName}`);
	fetchData.count(req, res, colName);
};

e.hookLogs = function (req, res) {
	let txnId = req.get('TxnId');
	let app = req.params.app;
	let colName = `${app}.hook`;
	logger.info(`[${txnId}] Fetching hook logs for ${app}`);
	logger.debug(`[${txnId}] Fetching hook logs for ${app} :: Collection :: ${colName}`);
	fetchData.index(req, res, colName);
};

e.hookLogsCount = function (req, res) {
	let txnId = req.get('TxnId');
	let app = req.params.app;
	let colName = `${app}.hook`;
	logger.info(`[${txnId}] Fetching hook logs for ${app}`);
	logger.debug(`[${txnId}] Fetching hook logs for ${app} :: Collection :: ${colName}`);
	fetchData.count(req, res, colName);
};

module.exports = e;