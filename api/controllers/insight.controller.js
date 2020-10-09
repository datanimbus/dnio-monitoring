const mongoose = require('mongoose');

let e = {};

const fetData = require('../../util/fetchData');

mongoose.connection.db.collection('user.logs').createIndex({ '_metadata.createdAt': 1 });
mongoose.connection.db.collection('group.logs').createIndex({ '_metadata.createdAt': 1 });

e.userInsight = function (req, res) {
	let colName = 'user.logs';
	fetData.index(req, res,colName);
};
e.userInsightCount = function (req, res) {
	let colName = 'user.logs';
	fetData.count(req, res,colName);
};

e.groupInsight = function (req, res) {
	let colName = 'group.logs';
	fetData.index(req, res,colName);
};
e.groupInsightCount = function (req, res) {
	let colName = 'group.logs';
	fetData.count(req, res,colName);
};

module.exports = e;