const fetData = require('../../util/fetchData');

let e = {};

e.logs = function (req, res) {
	let colName = 'dataService.logs';
	fetData.index(req, res, colName);
};
e.logsCount = function (req, res) {
	let colName = 'dataService.logs';
	fetData.count(req, res, colName);
};

module.exports = e;