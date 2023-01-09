const mongoose = require('mongoose');
const conf = require('../../config/config');

let e = {};
const logger = global.logger;

const fetData = require('../../util/fetchData');

(async () => {
	try {
		// logger.info('Trying to create Search Index For user.logs');
		// mongoose.connection.db.collection('user.logs').createIndex({ '_metadata.createdAt': 1 }, { name: 'Search Index' });
		logger.info('Trying to create Search Index For group.logs');
		await conf.indexUtil(mongoose, 'groups.logs', {
			key: { '_metadata.createdAt': 1 },
			options: {
				name: 'Search Index'
			}
		});
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