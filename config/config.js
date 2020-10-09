const fs = require('fs');
const cuti = require('@appveen/utils');
const log4js = cuti.logger.getLogger;
const loggerName = isK8sEnv() ? `brahma-monitoring [${process.env.HOSTNAME}]` : 'brahma-monitoring';
let logger = log4js.getLogger(loggerName);
let agentLogsttl = process.env.B2B_AGENT_LOG_TTL || '2592000';
logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
function isK8sEnv() {
	return process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT && process.env.ODPENV == 'K8s';
}

function getHostOSBasedLocation() {
	if (process.env.PLATFORM == 'NIX') return 'localhost';
	return 'host.docker.internal';
}

const odpNS = process.env.ODP_NAMESPACE;
if (isK8sEnv() && !odpNS) throw new Error('ODP_NAMESPACE not found. Please check your configMap');

function get(_service) {
	if (isK8sEnv()) {
		if (_service == 'ne') return `http://ne.${odpNS}`;
		if (_service == 'sm') return `http://sm.${odpNS}`;
		if (_service == 'pm') return `http://pm.${odpNS}`;
		if (_service == 'user') return `http://user.${odpNS}`;
		if (_service == 'gw') return `http://gw.${odpNS}`;
	} else if (fs.existsSync('/.dockerenv')) {
		if (_service == 'ne') return 'http://' + getHostOSBasedLocation() + ':10010';
		if (_service == 'sm') return 'http://' + getHostOSBasedLocation() + ':10003';
		if (_service == 'pm') return 'http://' + getHostOSBasedLocation() + ':10011';
		if (_service == 'user') return 'http://' + getHostOSBasedLocation() + ':10004';
		if (_service == 'gw') return 'http://' + getHostOSBasedLocation() + ':9080';
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
	mongoUrl += (process.env.MONGO_AUTHOR_DBNAME || 'odpConfig');
	return mongoUrl;
}

function mongoLogUrl() {
	let mongoUrl = process.env.MONGO_LOGS_URL || 'mongodb://localhost';
	if (!mongoUrl.endsWith('/')) mongoUrl += '/';
	mongoUrl += (process.env.MONGO_LOGS_DBNAME || 'odpLogs');
	return mongoUrl;
}

module.exports = {
	baseUrlSM: get('sm') + '/sm',
	mongoUrl: mongoUrl(),
	mongoLogUrl: mongoLogUrl(),
	baseUrlNE: get('ne') + '/ne',
	baseUrlUSR: get('user') + '/rbac',
	agentLogsttl : parseInt(agentLogsttl),
	NATSConfig: {
		url: process.env.NATS_HOST || 'nats://127.0.0.1:4222',
		user: process.env.NATS_USER || '',
		pass: process.env.NATS_PASS || '',
		// maxReconnectAttempts: process.env.NATS_RECONN_ATTEMPTS || 500,
		// reconnectTimeWait: process.env.NATS_RECONN_TIMEWAIT || 500
		maxReconnectAttempts: process.env.NATS_RECONN_ATTEMPTS || 500,
		connectTimeout: 2000,
		stanMaxPingOut: process.env.NATS_RECONN_TIMEWAIT || 500
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
	},
	vishnuDB: 'odpData',
	validationApi: get('user') + '/rbac/validate',
	secret: 'u?5k167v13w5fhjhuiweuyqi67621gqwdjavnbcvadjhgqyuqagsduyqtw87e187etqiasjdbabnvczmxcnkzn',
	refreshSecret: 'iouhzsueiryozayvrhisjhtojgbaburaoganpatraoaptehjgcjgccjagaurnautbabubhaiyasdcsddscds',
	isK8sEnv: isK8sEnv,
	mongoOptions:{
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME,
		useNewUrlParser: true
	},
	mongoOptionsForLogDb:{
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME,
		dbName: process.env.MONGO_LOGS_DBNAME || 'odpLogs',
		useNewUrlParser: true
	}
};