const mongoose = require('mongoose');

let e = {};
const logger = global.logger;

const fetData = require('../../util/fetchData');

(async () => {
	try {
		logger.info('Trying to create Index For user.logs');
		mongoose.connection.db.collection('user.logs').createIndex({ '_metadata.createdAt': 1 });
		logger.info('Trying to create Index For group.logs');
		mongoose.connection.db.collection('group.logs').createIndex({ '_metadata.createdAt': 1 });
	} catch (err) {
		logger.error(err);
	}
})();


e.userInsight = function (req, res) {
	let colName = 'user.logs';
	fetData.index(req, res, colName);
};
e.userInsightCount = function (req, res) {
	let colName = 'user.logs';
	fetData.count(req, res, colName);
};

e.botInsight = function (req, res) {
	let colName = 'user.logs';
	fetData.index(req, res, colName);
};
e.botInsightCount = function (req, res) {
	let colName = 'user.logs';
	fetData.count(req, res, colName);
};

e.groupInsight = function (req, res) {
	let colName = 'group.logs';
	fetData.index(req, res, colName);
};
e.groupInsightCount = function (req, res) {
	let colName = 'group.logs';
	fetData.count(req, res, colName);
};

module.exports = e;