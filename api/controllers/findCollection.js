'use strict';
let e = {};
const logger = global.logger;

let mongoose = require('mongoose');
e.findCollectionName = function (Id) {
	return global.mongoDBConfig.collection('services').findOne({ '_id': Id }, { app: 1, collectionName: 1 })
		.then(result => {
			if (result != null) {
				logger.debug(`findCollectionName() :: ${Id} :: ${result.app}.${result.collectionName}`);
				return `${result.app}.${result.collectionName}`;
			}
			else {
				return '';
			}

		})
		.catch(err => {
			return err;
		});
};

e.getHookCollectionName = function (Id) {
	return global.mongoDBConfig.collection('services').findOne({ '_id': Id }, { app: 1 })
		.then(result => {
			if (result != null) {
				logger.debug(`getHookCollectionName() :: ${Id} :: ${result.app}.hook`);
				return `${result.app}.hook`;
			}
			else {
				return '';
			}

		})
		.catch(err => {
			return err;
		});
};

e.transactionData = function (req, res) {
	let Id = req.swagger.params.txnId.value;
	let resBody = [];
	var promise1 = mongoose.connection.db.collection('sm.audit').find({ txnId: Id }).toArray();
	var promise2 = mongoose.connection.db.collection('globalSchema.audit').find({ txnId: Id }).toArray();
	var promise3 = mongoose.connection.db.collection('userMgmt.apps.audit').find({ txnId: Id }).toArray();
	var promise4 = mongoose.connection.db.collection('userMgmt.apps.audit').find({ txnId: Id }).toArray();
	var promise5 = mongoose.connection.db.collection('userMgmt.roles.audit').find({ txnId: Id }).toArray();
	var promise6 = mongoose.connection.db.collection('userMgmt.users.audit').find({ txnId: Id }).toArray();
	var promise7 = mongoose.connection.db.collection('wf.audit').find({ txnId: Id }).toArray();
	var promise8 = mongoose.connection.db.collection('sec.audit').find({ txnId: Id }).toArray();
	Promise.all([promise1, promise2, promise3, promise4, promise5, promise6, promise7, promise8])
		.then(function (values) {
			for (let i = 0; i < values.length; i++) {
				for (let j = 0; j < values[i].length; j++) {
					if (values[i].length > 0) {
						resBody.push(values[i][j]);
					}
				}
			}
			return res.status(200).json(resBody);
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});
};

module.exports = e;