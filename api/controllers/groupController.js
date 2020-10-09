let e = {};

const fetData = require('../../util/fetchData');

e.log = function (req, res) {
	let colName = 'group.logs';
	fetData.index(req, res,colName);
};
e.logCount = function (req, res) {
	let colName = 'group.logs';
	fetData.count(req, res,colName);
};

module.exports = e;