let e = {};

const fetData = require('../../util/fetchData');
const findCollection = require('./findCollection');

e.preHookLog = function (req, res) {
	let serviceName = req.params.srvcid;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data+'.preHook';
			fetData.index(req, res,data);
		});
};
e.preHookLogCount = function (req, res) {
	let serviceName = req.params.srvcid;
	findCollection.findCollectionName(serviceName)
		.then(function (data) {
			data = data+'.preHook';
			fetData.count(req, res,data);
		});

};

module.exports = e;