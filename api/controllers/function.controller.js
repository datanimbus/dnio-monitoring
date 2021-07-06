let e = {};

const fetData = require('../../util/fetchData');

e.functionConsoleLogs = function (req, res) {
	let app = req.swagger.params.app.value;
	let faasId = req.swagger.params.faasId.value;
	let filter = req.swagger.params.filter.value;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.faasId'] = faasId;
	req.swagger.params.filter.value = JSON.stringify(filter);
	let colName = 'faas.console.logs';
	fetData.index(req, res, colName);
};
e.functionConsoleLogsCount = function (req, res) {
	let app = req.swagger.params.app.value;
	let faasId = req.swagger.params.faasId.value;
	let filter = req.swagger.params.filter.value;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.faasId'] = faasId;
	req.swagger.params.filter.value = JSON.stringify(filter);
	let colName = 'faas.console.logs';
	fetData.count(req, res, colName);
};

module.exports = e;
