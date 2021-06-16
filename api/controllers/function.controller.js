let e = {};

const fetData = require('../../util/fetchData');

e.functionConsoleLogs = function (req, res) {
	let app = req.swagger.params.app.value;
	let functionId = req.swagger.params.function.value;
	let filter = req.swagger.params.filter.value;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.functionId'] = functionId;
	req.swagger.params.function.value = JSON.stringify(filter);
	let colName = 'function.console.logs';
	fetData.index(req, res, colName);
};
e.functionConsoleLogsCount = function (req, res) {
	let app = req.swagger.params.app.value;
	let functionId = req.swagger.params.function.value;
	let filter = req.swagger.params.filter.value;
	if (!filter) {
		filter = {};
	}
	if (typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	filter['context.app'] = app;
	filter['context.functionId'] = functionId;
	req.swagger.params.function.value = JSON.stringify(filter);
	let colName = 'function.console.logs';
	fetData.count(req, res, colName);
};

module.exports = e;
