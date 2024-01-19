'use strict';

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

// const mongoUrl = process.env.MONGO_AUTHOR_URL || 'mongodb://localhost:27017';
// const mongoLogsDB = process.env.MONGO_LOGS_URL || 'mongodb://localhost:27017';
// const dbName = process.env.MONGO_AUTHOR_DBNAME || 'datastackConfig';
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
		// await mongoose.connect(mongoLogsDB, conf.mongoOptionsForLogDb);
		await mongoose.connect(conf.dbLogsUrl, conf.dbLogsOptions);
		try {
			let indexObject = {
				key: { app: 1, logType: 1, operation: 1, serviceId: 1, txnId: 1, timestamp: 1 },
				options: { name: 'DS_LOGS_INDEX' }
			};
			await conf.indexUtil(mongoose, 'dataService.logs', indexObject);
		} catch (err) {
			logger.error(err.message);
		}
		global.client = clients.init(
			process.env.STREAMING_CHANNEL || 'datastack-cluster',
			clientId,
			conf.streamingConfig
		);
		let queueMgmt = require('./util/queueMgmt');
		let logToQueue = dataStackUtils.logToQueue('mon', queueMgmt.client, conf.queueNames.systemService, 'mon.logs');
		app.use(logToQueue);
		logger.info('Connected to Logs DB');
		logger.trace(`Connected to Logs DB URL: ${mongoose.connection.host}`);
		logger.trace(`Connected to Logs DB:${mongoose.connection.name}`);
		logger.trace(`Connected via User: ${mongoose.connection.user}`);

		// const client = await MongoClient.connect(mongoUrl, conf.mongoOptions);
		// const client = await MongoClient.connect(conf.dbAuthorUrl, conf.dbAuthorOptions);
		await mongoose.createConnection(conf.dbAuthorUrl, conf.dbAuthorOptions);

		// global.mongoDBConfig = client.db(conf.dbAuthorOptions.dbName);
		// global.dbAuthorConnection = client.db(conf.dbAuthorOptions.dbName);

		global.mongoDBConfig = mongoose.connections[1];
		global.dbAuthorConnection = mongoose.connections[1];

		logger.info('Connected to Author DB ', conf.dbAuthorOptions.dbName);
		mongoose.connection.on('connecting', () => { logger.info('-------------------------Auhtor DB connecting-------------------------'); });
		mongoose.connection.on('close', () => { logger.error('-------------------------Author DB lost connection-------------------------'); });
		mongoose.connection.on('reconnect', () => { logger.info('-------------------------Auhtor DB reconnected-------------------------'); });
		mongoose.connection.on('connected', () => { logger.info('Author DB connected'); });
		mongoose.connection.on('reconnectFailed', () => { logger.error('-------------------------Auhtor DB failed to reconnect-------------------------'); });

		await require('./util/init')()
		
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

app.use('/mon', require('./util/auth'), require('./api/controllers/controller'));

app.use(function (error, req, res, next) {
	if (error) {
		logger.error('Global Error handler :: ', error);
		if (!res.headersSent) {
			let statusCode = error.statusCode || 500;
			if (error.message.includes('APP_NAME_ERROR')) {
				statusCode = 400;
			}
			res.status(statusCode).json({
				message: error.message
			});
		}
	} else {
		next();
	}
});



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

