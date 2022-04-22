let e = {};

const fetData = require('../../util/fetchData');

e.functionConsoleLogs = function (req, res) {
	let app = req.params.app;
	let faasId = req.params.faasId;
	let filter = req.query.filter;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.faasId'] = faasId;
	req.query.filter = JSON.stringify(filter);
	let colName = 'faas.console.logs';
	fetData.index(req, res, colName);
};
e.functionConsoleLogsCount = function (req, res) {
	let app = req.params.app;
	let faasId = req.params.faasId;
	let filter = req.query.filter;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.faasId'] = faasId;
	req.query.filter = JSON.stringify(filter);
	let colName = 'faas.console.logs';
	fetData.count(req, res, colName);
};

module.exports = e;
