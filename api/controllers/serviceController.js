let e = {};
let mongoose = require('mongoose');
const logger = global.logger;

function createIndexes(collection) {
	logger.debug('Creating default Indexes');
	let keys = ['_metadata.lastUpdated', '_metadata.deleted', '_metadata.createdAt'];
	let collections = ['audit', 'logs', 'preHook', 'postHook'];
	let promises = collections.map(_c => {
		return mongoose.connection.db.createCollection(`${collection}.${_c}`)
			.finally(() => {
				let indexPromises = keys.map(_k => {
					return mongoose.connection.db.collection(`${collection}.${_c}`)
						.createIndex({ [_k]: 1 }, { name: 'Search Index' }).catch();
				});
				return Promise.all(indexPromises);
			});
	});
	return Promise.all(promises);
}

e.create = (req, res) => {
	let expiry = req.body.data.expiry;
	if (expiry) expiry = changeToSeconds(expiry);
	let serviceName = req.body.data.srvc;
	return createIndexes(serviceName)
		.then(() => {
			if (expiry)
				return mongoose.connection.db.collection(serviceName + '.audit')
					.createIndex({ 'timeStamp': 1 }, { expireAfterSeconds: expiry });
		})
		.then(() => {
			res.json({ message: 'MON registered service' });
		})
		.catch(err => {
			logger.error(err);
			res.json({ message: err.message });
		});
};

e.update = (req, res) => {
	let expiry = req.body.data.expiry;
	let serviceName = req.body.data.srvc;
	let oldCollectionName = req.body.data.oldCollectionName;
	let newCollectionName = req.body.data.newCollectionName;
	rename(oldCollectionName, newCollectionName)
		.then(() => {
			return mongoose.connection.db.createCollection(serviceName + '.audit')
				.then(() => createIndexes(serviceName))
				.then(() => {
					if (expiry) {
						expiry = changeToSeconds(expiry);
						return mongoose.connection.db.collection(serviceName + '.audit').indexes()
							.then(res => {
								let result = {};
								for (let i = 0; i < res.length; i++) {
									if (res[i].name == 'timeStamp_1') {
										result = res[i];
									}
								}
								if (Object.keys(result).length > 0 && result.expireAfterSeconds != expiry) {
									mongoose.connection.db.collection(serviceName + '.audit').dropIndex('timeStamp_1')
										.then(() => {
											mongoose.connection.db.collection(serviceName + '.audit')
												.createIndex({ 'timeStamp': 1 }, { expireAfterSeconds: expiry });
										});
								}
								else {
									mongoose.connection.db.collection(serviceName + '.audit')
										.createIndex({ 'timeStamp': 1 }, { expireAfterSeconds: expiry });
								}
							})
							.then(() => {
								res.json({ message: 'index updated ' });
							})
							.catch(err => {
								res.status(500).json(err);
							});
					}
					else {
						mongoose.connection.db.collection(serviceName + '.audit').indexes()
							.then(res => {
								if (res[1]) {
									mongoose.connection.db.collection(serviceName + '.audit').dropIndex(res[1].name);
								}
							})
							.then(() => {
								res.json({ message: 'index updated' });
							});
					}
				});
		})
		.catch(err => {
			res.status(500).json(err);
		});


};

e.delete = (req, res) => {
	let serviceName = req.params.collection;
	mongoose.connection.db.collection(serviceName + '.audit').drop()
		.then(out => {
			logger.debug(out);
			return mongoose.connection.db.collection(serviceName + '.logs').drop();
		})
		.then(out => {
			logger.debug(out);
			return mongoose.connection.db.collection(serviceName + '.preHook').drop();
		})
		.then(out => {
			logger.debug(out);
			return mongoose.connection.db.collection(serviceName + '.postHook').drop();
		})
		.then(() => {
			res.json({ message: 'deleted ' });
		})

		.catch(err => {
			res.status(500).send(err);
		});
};



function rename(oldColl, newColl) {
	return mongoose.connection.db.collection(oldColl + '.audit').rename(newColl + '.audit')
		.then(out => {
			logger.info('Collection name changed from ' + oldColl + '.audit' + ' to ' + newColl + '.audit');
			logger.debug(out);
			return mongoose.connection.db.collection(oldColl + '.logs').rename(newColl + '.logs');
		})
		.then(out => {
			logger.info('Collection name changed from ' + oldColl + '.logs' + ' to ' + newColl + '.logs');
			logger.debug(out);
			return mongoose.connection.db.collection(oldColl + '.preHook').rename(newColl + '.preHook');
		})
		.then(out => {
			logger.info('Collection name changed from ' + oldColl + '.preHook' + ' to ' + newColl + '.preHook');
			logger.debug(out);
			return mongoose.connection.db.collection(oldColl + '.postHook').rename(newColl + '.postHook');
		})
		.catch((err) => {
			logger.error(err.message);
		});
}


function changeToSeconds(expiry) {
	let str = expiry.split(' ');
	if (str[1] == 'month' || str[1] === 'months') {
		return parseInt(str[0]) * 3600 * 24 * 30;
	}
	if (str[1] == 'year' || str[1] === 'years') {
		return parseInt(str[0]) * 3600 * 24 * 30 * 12;
	}
	if (str[1] == 'minute' || str[1] === 'minutes') {
		return parseInt(str[0]) * 60;
	}
	if (str[1] == 'hour' || str[1] === 'hours') {
		return parseInt(str[0]) * 3600;
	}
	if (str[1] == 'day' || str[1] === 'days') {
		return parseInt(str[0]) * 3600 * 24;
	}
	if (str[1] == 'second' || str[1] === 'seconds') {
		return parseInt(str[0]);
	}
}

module.exports = e;