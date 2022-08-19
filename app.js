'use strict';
// const fs = require('fs');
// const path = require('path');
// const jsyaml = require('js-yaml');
// const swaggerTools = require('swagger-tools');
const express = require('express');
const app = express();
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

let debugDB = false;
if (process.env.LOG_LEVEL == 'DB_DEBUG') { process.env.LOG_LEVEL = 'debug'; debugDB = true; }
const utils = require('@appveen/utils');
const dataStackUtils = require('@appveen/data.stack-utils');
const conf = require('./config/config.js');

const log4js = utils.logger.getLogger;
let version = require('./package.json').version;
const loggerName = conf.isK8sEnv() ? `[${process.env.DATA_STACK_NAMESPACE}] [${process.env.HOSTNAME}] [MON ${version}]` : `[MON ${version}]`;

const logger = log4js.getLogger(loggerName);
const clients = dataStackUtils.streaming;
logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

global.Promise = bluebird;
global.logger = logger;
global.mongoDBConfig = null;
mongoose.Promise = global.Promise;

const mongoUrl = process.env.MONGO_AUTHOR_URL || 'mongodb://localhost:27017';
const mongoLogsDB = process.env.MONGO_LOGS_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_AUTHOR_DBNAME || 'datastackConfig';
const timeOut = process.env.API_REQUEST_TIMEOUT || 120;
const clientId = conf.isK8sEnv() ? `${process.env.HOSTNAME}` : 'MON';

if (debugDB) mongoose.set('debug', customLogger);

function customLogger(coll, op, doc, proj) {
	process.stdout.write(`Mongoose: ${coll}.${op}(${JSON.stringify(doc)}`);
	if (proj) {
		process.stdout.write(',' + JSON.stringify(proj) + ')\n');
	} else {
		process.stdout.write(')\n');
	}
}

if (conf.isK8sEnv()) {
	logger.info('*** K8s environment detected ***');
	logger.info('Image version: ' + process.env.IMAGE_TAG);
} else {
	logger.info('*** Local environment detected ***');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
	try {
		await mongoose.connect(mongoLogsDB, conf.mongoOptionsForLogDb);
		try {
			const val = await mongoose.connection.db.collection('dataService.logs').createIndex({ app: 1, logType: 1, operation: 1, serviceId: 1, txnId: 1, timestamp: 1 });
			logger.debug('Created Index for dataService.logs', val);
		} catch (err) {
			logger.error(err);
		}
		global.client = clients.init(
			process.env.STREAMING_CHANNEL || 'datastack-cluster',
			clientId,
			conf.streamingConfig
		);
		let queueMgmt = require('./util/queueMgmt');
		let logToQueue = dataStackUtils.logToQueue('mon', queueMgmt.client, conf.queueNames.systemService, 'mon.logs');
		app.use(logToQueue);
		logger.info('Connected to DB');
		logger.trace(`Connected to URL: ${mongoose.connection.host}`);
		logger.trace(`Connected to DB:${mongoose.connection.name}`);
		logger.trace(`Connected via User: ${mongoose.connection.user}`);
		const client = await MongoClient.connect(mongoUrl, conf.mongoOptions);
		global.mongoDBConfig = client.db(dbName);
		logger.info('Connected to datastackConfig DB');
		client.on('connecting', () => { logger.info('-------------------------datastackConfig connecting-------------------------'); });
		client.on('close', () => { logger.error('-------------------------datastackConfig lost connection-------------------------'); });
		client.on('reconnect', () => { logger.info('-------------------------datastackConfig reconnected-------------------------'); });
		client.on('connected', () => { logger.info('datastackConfig connected'); });
		client.on('reconnectFailed', () => { logger.error('-------------------------datastackConfig failed to reconnect-------------------------'); });

		app.use('/mon', require('./api/controllers/controller'));

		const port = process.env.PORT || 10005;
		const server = app.listen(port, (err) => {
			if (!err) {
				logger.info('Server started on port ' + port);
				app.use((err, req, res, next) => {
					if (err) {
						if (!res.headersSent)
							return res.status(500).json({ message: err.message });
						return;
					}
					next();
				});
			} else
				logger.error(err);
		});
		server.setTimeout(parseInt(timeOut) * 1000);
	} catch (err) {
		logger.error('Cannot Connect to DB');
		logger.error(err);
		process.exit(0);
	}
})();

mongoose.connection.on('connecting', () => { logger.info('-------------------------connecting-------------------------'); });
mongoose.connection.on('disconnected', () => { logger.error('-------------------------lost connection-------------------------'); });
mongoose.connection.on('reconnect', () => { logger.info('-------------------------reconnected-------------------------'); });
mongoose.connection.on('reconnectFailed', () => { logger.error('-------------------------failed to reconnect-------------------------'); });


const logMiddleware = utils.logMiddleware.getLogMiddleware(logger);
app.use(logMiddleware);



