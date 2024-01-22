const cuti = require('@appveen/utils');
const log4js = cuti.logger.getLogger;
const loggerName = isK8sEnv() ? `brahma-monitoring [${process.env.HOSTNAME}]` : 'brahma-monitoring';
let logger = log4js.getLogger(loggerName);
let agentLogsttl = process.env.B2B_AGENT_LOG_TTL || '2592000';
logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

function isK8sEnv() {
	return process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT;
}

const dataStackNS = process.env.DATA_STACK_NAMESPACE;
if (isK8sEnv() && !dataStackNS) throw new Error('DATA_STACK_NAMESPACE not found. Please check your configMap');

function get(_service) {
	if (isK8sEnv()) {
		if (_service == 'ne') return `http://ne.${dataStackNS}`;
		if (_service == 'sm') return `http://sm.${dataStackNS}`;
		if (_service == 'pm') return `http://pm.${dataStackNS}`;
		if (_service == 'user') return `http://user.${dataStackNS}`;
		if (_service == 'gw') return `http://gw.${dataStackNS}`;
	} else {
		if (_service == 'ne') return 'http://localhost:10010';
		if (_service == 'sm') return 'http://localhost:10003';
		if (_service == 'pm') return 'http://localhost:10011';
		if (_service == 'user') return 'http://localhost:10004';
		if (_service == 'gw') return 'http://localhost:9080';
	}
}

function mongoUrl() {
	let mongoUrl = process.env.MONGO_AUTHOR_URL || 'mongodb://localhost';
	if (!mongoUrl.endsWith('/')) mongoUrl += '/';
	mongoUrl += (process.env.MONGO_AUTHOR_DBNAME || 'datastackConfig');
	return mongoUrl;
}

function mongoLogUrl() {
	let mongoUrl = process.env.MONGO_LOGS_URL || 'mongodb://localhost';
	if (!mongoUrl.endsWith('/')) mongoUrl += '/';
	mongoUrl += (process.env.MONGO_LOGS_DBNAME || 'datastackLogs');
	return mongoUrl;
}

function dbAuthorUrl() {
	let dbAuthorUrl = process.env.DB_AUTHOR_URL || process.env.MONGO_AUTHOR_URL || 'mongodb://localhost';
	// if (!dbAuthorUrl.endsWith('/')) dbAuthorUrl += '/';
	// dbAuthorUrl += (process.env.DB_AUTHOR_DBNAME || process.env.MONGO_AUTHOR_DBNAME || 'datastackConfig');
	return dbAuthorUrl;
}

function dbLogsUrl() {
	let dbLogsUrl = process.env.DB_LOGS_URL || process.env.MONGO_LOGS_URL || 'mongodb://localhost';
	// if (!dbLogsUrl.endsWith('/')) dbLogsUrl += '/';
	// dbLogsUrl += (process.env.DB_LOGS_DBNAME || process.env.MONGO_LOGS_DBNAME || 'datastackLogs');
	return dbLogsUrl;
}

async function fetchIndexes(mongoose, collectionName, indexKeys) {
	let indexes = await mongoose.connection.db.collection(collectionName).indexes();
	const indexObjectKeys = Object.keys(indexKeys);
	let indexNames = [];
	indexes.forEach(index => {
		if (Object.keys(index.key).length != indexObjectKeys.length) return;
		let matches = true;
		indexObjectKeys.forEach(key => {
			matches = index.key[key] == indexKeys[key] && matches;
		});
		if (matches) indexNames.push(index.name);
	});
	return indexNames;
}

async function dropIndexes(mongoose, collectionName, indexes) {
	return indexes.reduce(async (p, c) => {
		await p;
		return await mongoose.connection.db.collection(collectionName).dropIndex(c);
	}, Promise.resolve());
}

async function indexUtil(mongoose, collectionName, indexObject) {
	logger.debug(`IndexUtil :: ${collectionName} :: ${indexObject.options.name}`);
	try {
		let indexNames = await fetchIndexes(mongoose, collectionName, indexObject.key);
		logger.debug(`IndexUtil :: ${collectionName} :: Matching indexes :: ${indexNames.join(',')}`);
		let indexesToDrop = indexNames.filter(i => i != indexObject.options.name);
		logger.debug(`IndexUtil :: ${collectionName} :: Indexes to drop :: ${indexesToDrop.join(',') || 'Nil'}`);
		if (indexesToDrop < 1) {
			logger.debug(`IndexUtil :: ${collectionName} :: ${indexObject.options.name} already exists`);
			return;
		}
		await dropIndexes(mongoose, collectionName, indexesToDrop);
		const val = await mongoose.connection.db.collection(collectionName).createIndex(indexObject.key, indexObject.options);
		logger.debug(`IndexUtil :: Created Index for ${collectionName} :: ${val}`);
	} catch (e) {
		logger.error(`Error creating index for ${collectionName} :: ${indexObject.options.name}`);
		logger.error(e.message);
	}
}

module.exports = {
	baseUrlSM: get('sm') + '/sm',
	mongoUrl: mongoUrl(),
	mongoLogUrl: mongoLogUrl(),
	dbAuthorUrl: dbAuthorUrl(),
	dbLogsUrl: dbLogsUrl(),
	baseUrlNE: get('ne') + '/ne',
	baseUrlUSR: get('user') + '/rbac',
	agentLogsttl: parseInt(agentLogsttl),
	streamingConfig: {
		url: process.env.STREAMING_HOST || 'nats://127.0.0.1:4222',
		user: process.env.STREAMING_USER || '',
		pass: process.env.STREAMING_PASS || '',
		// maxReconnectAttempts: process.env.STREAMING_RECONN_ATTEMPTS || 500,
		// reconnectTimeWait: process.env.STREAMING_RECONN_TIMEWAIT_MILLI || 500
		maxReconnectAttempts: process.env.STREAMING_RECONN_ATTEMPTS || 500,
		connectTimeout: 2000,
		stanMaxPingOut: process.env.STREAMING_RECONN_TIMEWAIT_MILLI || 500
	},
	queueNames: {
		dataService: 'dataService',
		systemService: 'systemService',
		prehookCreate: 'prehookCreate',
		posthookCreate: 'posthookCreate',
		posthookUpdate: 'posthookUpdate',
		auditQueue: 'auditQueue',
		auditQueueRemove: 'auditQueueRemove',
		interactionLogs: 'interactionLogs',
		interactionAudit: 'interactionAudit',
		agentLogs: 'agentLogs',
		userInsight: 'user-insight',
		groupInsight: 'group-insight',
		logEvents: 'logEvents',
		faasConsoleLogs: 'faasConsoleLogs'
	},
	vishnuDB: 'datastackData',
	validationApi: get('user') + '/rbac/validate',
	secret: 'u?5k167v13w5fhjhuiweuyqi67621gqwdjavnbcvadjhgqyuqagsduyqtw87e187etqiasjdbabnvczmxcnkzn',
	refreshSecret: 'iouhzsueiryozayvrhisjhtojgbaburaoganpatraoaptehjgcjgccjagaurnautbabubhaiyasdcsddscds',
	isK8sEnv: isK8sEnv,
	mongoOptions: {
		// reconnectTries: process.env.MONGO_RECONN_TRIES,
		// reconnectInterval: process.env.MONGO_RECONN_TIME_MILLI,
		useNewUrlParser: true
	},
	mongoOptionsForLogDb: {
		// reconnectTries: process.env.MONGO_RECONN_TRIES,
		// reconnectInterval: process.env.MONGO_RECONN_TIME_MILLI,
		dbName: process.env.MONGO_LOGS_DBNAME || 'datastackLogs',
		useNewUrlParser: true
	},
	dbAuthorOptions: {
		dbName: process.env.DB_AUTHOR_DBNAME || process.env.MONGO_AUTHOR_DBNAME || 'datastackLogs',
		useNewUrlParser: true
	},
	dbLogsOptions: {
		dbName: process.env.DB_LOGS_DBNAME || process.env.MONGO_LOGS_DBNAME || 'datastackLogs',
		useNewUrlParser: true
	},
	API_LOGS_TTL_DAYS: process.env.API_LOGS_TTL_DAYS ? parseInt(process.env.API_LOGS_TTL_DAYS, 10) : 30,
	FAAS_LOGS_TTL_DAYS: process.env.FAAS_LOGS_TTL_DAYS ? parseInt(process.env.FAAS_LOGS_TTL_DAYS, 10) : 30,
	TOKEN_SECRET: process.env.TOKEN_SECRET || 'u?5k167v13w5fhjhuiweuyqi67621gqwdjavnbcvadjhgqyuqagsduyqtw87e187etqiasjdbabnvczmxcnkzn',
	RBAC_JWT_KEY: process.env.RBAC_JWT_KEY || 'u?5k167v13w5fhjhuiweuyqi67621gqwdjavnbcvadjhgqyuqagsduyqtw87e187etqiasjdbabnvczmxcnkzn',
	indexUtil
};