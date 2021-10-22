'use strict';
const fs = require('fs');
const path = require('path');
const jsyaml = require('js-yaml');
const swaggerTools = require('swagger-tools');
const express = require('express');
const app = express();
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const mongo = require('mongodb').MongoClient;

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

mongoose.connect(mongoLogsDB, conf.mongoOptionsForLogDb, (err) => {
	if (err) {
		logger.error('Cannot Connect to DB');
		logger.error(err);
		process.exit(0);
	} else {
		mongoose.connection.db.collection('dataService.logs').createIndex({ app: 1, logType: 1, operation: 1, serviceId: 1, txnId: 1, timestamp: 1 }).then(val => {
			logger.debug('Created Index for dataService.logs', val);
		}).catch(err => {
			logger.error(err);
		});
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


		mongo.connect(mongoUrl, conf.mongoOptions, (error, db) => {
			if (error) logger.error(error.message);
			if (db) {
				global.mongoDBConfig = db.db(dbName);
				logger.info('Connected to datastackConfig DB');
				db.on('connecting', () => { logger.info('-------------------------datastackConfig connecting-------------------------'); });
				db.on('close', () => { logger.error('-------------------------datastackConfig lost connection-------------------------'); });
				db.on('reconnect', () => { logger.info('-------------------------datastackConfig reconnected-------------------------'); });
				db.on('connected', () => { logger.info('datastackConfig connected'); });
				db.on('reconnectFailed', () => { logger.error('-------------------------datastackConfig failed to reconnect-------------------------'); });

				// swaggerRouter configuration
				var options = {
					swaggerUi: path.join(__dirname, '/swagger.json'),
					controllers: path.join(__dirname, './api/controllers'),
					useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
				};

				// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
				var spec = fs.readFileSync(path.join(__dirname, 'api/swagger/swagger.yaml'), 'utf8');
				var swaggerDoc = jsyaml.safeLoad(spec);

				swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

					// Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
					app.use(middleware.swaggerMetadata());

					// Validate Swagger requests
					app.use(middleware.swaggerValidator());

					// Route validated requests to appropriate controller
					app.use(middleware.swaggerRouter(options));

					// Serve the Swagger documents and Swagger UI
					// app.use(middleware.swaggerUi());

					// Start the server
					var port = process.env.PORT || 10005;
					var server = app.listen(port, (err) => {
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
				});
			}
		});
	}
});

mongoose.connection.on('connecting', () => { logger.info('-------------------------connecting-------------------------'); });
mongoose.connection.on('disconnected', () => { logger.error('-------------------------lost connection-------------------------'); });
mongoose.connection.on('reconnect', () => { logger.info('-------------------------reconnected-------------------------'); });
mongoose.connection.on('reconnectFailed', () => { logger.error('-------------------------failed to reconnect-------------------------'); });


var logMiddleware = utils.logMiddleware.getLogMiddleware(logger);
app.use(logMiddleware);
