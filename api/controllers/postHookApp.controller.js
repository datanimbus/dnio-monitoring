let e = {};

const fetData = require('../../util/fetchData');
const findCollection = require('./findCollection');
const logger = global.logger;

e.postHookLog = function (req, res) {
	let serviceName = req.swagger.params.srvcid.value;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data+'.postHook';
			fetData.index(req, res,data);
		})
		.catch(err=>{
			logger.error(err.message);
			res.status(500).send(err.message);
		});
	
};
e.postHookLogCount = function (req, res) {
	let serviceName = req.swagger.params.srvcid.value;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data+'.postHook';
			fetData.count(req, res,data);
		})
		.catch(err=>{
			logger.error(err.message);
			res.status(500).send(err.message);
		});
	
};

module.exports = e;