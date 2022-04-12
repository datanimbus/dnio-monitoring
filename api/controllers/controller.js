let auditController = require('./audit.controller');
let logController = require('./log.controller');
let preHooksController = require('./preHooks.controller');
let mfGenController = require('./mfGen.controller');
let preHookDefController = require('./preHooksApp.controller');
let postHookDefController = require('./postHookApp.controller');
let appCenterLogs = require('./appCenterLogs');
let serviceManagerController = require('./serviceManager');
let userManagerController = require('./userManager');
let uiLogController = require('./uiLog.controller.js');
let serviceController = require('./serviceController');
let insightController = require('./insight.controller');
let agentController = require('./agent.controller');
let dataServiceController = require('./dataService.controller');
let functionController = require('./function.controller');

// let e = {};

// e.uiLogList = uiLogController.index;
// e.uiLogCount = uiLogController.count;
// e.uiLogCreate = uiLogController.create;

// e.logList = logController.index;
// e.logCount = logController.count;

// e.preHooksList = preHooksController.index;
// e.preHooksCount = preHooksController.count;

// e.mfGenList = mfGenController.index;
// e.mfGenCount = mfGenController.count;

// e.audit = auditController.auditLog;
// e.auditCount = auditController.auditLogCount;
// e.appcenterAuditPurge = auditController.appcenterAuditPurge;
// e.txnAudit = auditController.txnAudit;

// e.preHook = preHookDefController.preHookLog;
// e.preHookCount = preHookDefController.preHookLogCount;

// e.postHook = postHookDefController.postHookLog;
// e.postHookCount = postHookDefController.postHookLogCount;

// e.appCenterLog = appCenterLogs.appCenterLog;
// e.appCenterLogCount = appCenterLogs.appCenterLogCount;
// e.logPurge = appCenterLogs.logPurge;

// e.smLogs = serviceManagerController.log;
// e.smLogsCount = serviceManagerController.logCount;

// e.smAudit = serviceManagerController.smAudit;
// e.smAuditCount = serviceManagerController.smAuditCount;
// e.authorAuditPurge = serviceManagerController.authorAuditPurge;

// e.globalSchemaAudit = serviceManagerController.globalSchemaAudit;
// e.globalSchemaAuditCount = serviceManagerController.globalSchemaAuditCount;

// e.userLogs = insightController.userInsight;
// e.userLogsCount = insightController.userInsightCount;
// e.botLogs = insightController.botInsight;
// e.botLogsCount = insightController.botInsightCount;
// e.health = userManagerController.health;
// e.readiness = userManagerController.readiness;


// e.userDomainAudit = userManagerController.userDomainAudit;
// e.userDomainAuditCount = userManagerController.userDomainAuditCount;

// e.userRoleAudit = userManagerController.userRoleAudit;
// e.userRoleAuditCount = userManagerController.userRoleAuditCount;

// e.userAudit = userManagerController.userAudit;
// e.userAuditCount = userManagerController.userAuditCount;

// e.groupLog = insightController.groupInsight;
// e.groupLogCount = insightController.groupInsightCount;

// e.deleteCollection = serviceController.delete;
// e.create = serviceController.create;
// e.update = serviceController.update;

// e.agentLog = agentController.agentLog;
// e.agentLogInsert = agentController.agentLogInsert;
// e.agentLogCount = agentController.agentLogCount;
// e.gatewayAgentLog = agentController.gatewayAgentLog;
// e.gatewayAgentLogCount = agentController.gatewayAgentLogCount;
// e.EdgeGatewayAgentLog = agentController.EdgeGatewayAgentLog;
// e.EdgeGatewayAgentLogCount = agentController.EdgeGatewayAgentLogCount;

// e.dataServiceLog = dataServiceController.logs;
// e.dataServiceLogCount = dataServiceController.logsCount;
// e.appHookLogs = dataServiceController.hookLogs;
// e.appHookLogsCount = dataServiceController.hookLogsCount;


// e.functionLog = functionController.functionConsoleLogs;
// e.functionLogCount = functionController.functionConsoleLogsCount;


// module.exports = e;


const router = require('express').Router();


router.get('/logs', mapSwaggerParams, logController.index);
router.get('/logs/count', mapSwaggerParams, logController.count);
router.get('/appCenter/:id/logs', mapSwaggerParams, appCenterLogs.appCenterLog);
router.get('/appCenter/:id/logs/count', mapSwaggerParams, appCenterLogs.appCenterLogCount);
router.get('/gateway/agent/logs', mapSwaggerParams, agentController.gatewayAgentLog);
router.get('/gateway/agent/logs/count', mapSwaggerParams, agentController.gatewayAgentLogCount);
router.get('/edgeGateway/agent/logs', mapSwaggerParams, agentController.EdgeGatewayAgentLog);
router.get('/edgeGateway/agent/logs/count', mapSwaggerParams, agentController.EdgeGatewayAgentLogCount);
router.get('/:app/agent/logs', mapSwaggerParams, agentController.agentLog);
router.get('/:app/agent/logs/count', mapSwaggerParams, agentController.agentLogCount);
router.get('/:app/hooks', mapSwaggerParams, dataServiceController.hookLogs);
router.get('/:app/hooks/count', mapSwaggerParams, dataServiceController.hookLogsCount);
router.get('/:app/:faasId/console/logs', mapSwaggerParams, functionController.functionConsoleLogs);
router.get('/:app/:faasId/console/logs/count', mapSwaggerParams, functionController.functionConsoleLogsCount);
router.post('/agent/logs', mapSwaggerParams, agentController.agentLogInsert);
router.get('/ui/logs', mapSwaggerParams, uiLogController.index);
router.post('/ui/logs', mapSwaggerParams, uiLogController.create);
router.get('/ui/logs/count', mapSwaggerParams, uiLogController.count);
router.get('/preHooks', mapSwaggerParams, preHooksController.index);
router.get('/preHooks/count', mapSwaggerParams, preHooksController.count);
router.get('/mfGen', mapSwaggerParams, mfGenController.index);
router.get('/mfGen/count', mapSwaggerParams, mfGenController.count);
router.get('/appCenter/:srvcid/audit', mapSwaggerParams, auditController.auditLog);
router.get('/appCenter/:srvcid/audit/count', mapSwaggerParams, auditController.auditLogCount);
router.delete('/appCenter/:srvcid/audit/purge', mapSwaggerParams, auditController.appcenterAuditPurge);
router.delete('/appCenter/:srvcid/log/purge', mapSwaggerParams, appCenterLogs.logPurge);
router.get('/appCenter/:srvcid/preHook', mapSwaggerParams, preHooksController.index);
router.get('/appCenter/:srvcid/preHook/count', mapSwaggerParams, preHookDefController.preHookLogCount);
router.get('/appCenter/:srvcid/postHook', mapSwaggerParams, postHookDefController.postHookLog);
router.get('/appCenter/:srvcid/postHook/count', mapSwaggerParams, postHookDefController.postHookLogCount);
router.get('/author/sm/log', mapSwaggerParams, serviceManagerController.log);
router.get('/author/sm/log/count', mapSwaggerParams, serviceManagerController.logCount);
router.get('/author/sm/audit', mapSwaggerParams, serviceManagerController.smAudit);
router.get('/author/sm/audit/count', mapSwaggerParams, serviceManagerController.smAuditCount);
router.get('/author/globalSchemaAudit', mapSwaggerParams, serviceManagerController.globalSchemaAudit);
router.get('/author/globalSchemaAudit/count', mapSwaggerParams, serviceManagerController.globalSchemaAuditCount);
router.get('/author/user/log', mapSwaggerParams, insightController.userInsight);
router.get('/author/user/log/count', mapSwaggerParams, insightController.userInsightCount);
router.get('/author/bot/log', mapSwaggerParams, insightController.botInsight);
router.get('/author/bot/log/count', mapSwaggerParams, insightController.botInsightCount);
router.get('/author/userRoleAudit', mapSwaggerParams, userManagerController.userRoleAudit);
router.get('/author/userRoleAudit/count', mapSwaggerParams, userManagerController.userRoleAuditCount);
router.get('/author/userDomainAudit', mapSwaggerParams, userManagerController.userDomainAudit);
router.get('/author/userDomainAudit/count', mapSwaggerParams, userManagerController.userDomainAuditCount);
router.get('/author/userAudit', mapSwaggerParams, userManagerController.userAudit);
router.get('/author/userAudit/count', mapSwaggerParams, userManagerController.userAuditCount);
router.get('/dataService/log', mapSwaggerParams, dataServiceController.logs);
router.get('/dataService/log/count', mapSwaggerParams, dataServiceController.logsCount);
router.get('/author/group/log', mapSwaggerParams, insightController.groupInsight);
router.get('/author/group/log/count', mapSwaggerParams, insightController.groupInsightCount);
router.get('/author/audit/:txnId', mapSwaggerParams, auditController.txnAudit);
router.delete('/author/:srvcid/audit/purge', mapSwaggerParams, serviceManagerController.authorAuditPurge);
router.get('/health/live', mapSwaggerParams, userManagerController.health);
router.get('/health/ready', mapSwaggerParams, userManagerController.readiness);
router.delete('/delete/:collection', mapSwaggerParams, serviceController.delete);
router.post('/create', mapSwaggerParams, serviceController.create);
router.put('/update', mapSwaggerParams, serviceController.update);


module.exports = router;


function mapSwaggerParams(req, res, next) {
	const params = {};
	Object.assign(params, req.params, req.query);
	req.swagger = {
		params
	};
	next();
}
