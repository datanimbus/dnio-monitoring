

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


router.get('/logs', logController.index);
router.get('/logs/count', logController.count);
router.get('/appCenter/:id/logs', appCenterLogs.appCenterLog);
router.get('/appCenter/:id/logs/count', appCenterLogs.appCenterLogCount);
router.get('/gateway/agent/logs', agentController.gatewayAgentLog);
router.get('/gateway/agent/logs/count', agentController.gatewayAgentLogCount);
router.get('/edgeGateway/agent/logs', agentController.EdgeGatewayAgentLog);
router.get('/edgeGateway/agent/logs/count', agentController.EdgeGatewayAgentLogCount);
router.get('/:app/agent/logs', agentController.agentLog);
router.get('/:app/agent/logs/count', agentController.agentLogCount);
router.get('/:app/hooks', dataServiceController.hookLogs);
router.get('/:app/hooks/count', dataServiceController.hookLogsCount);
router.get('/:app/:faasId/console/logs', functionController.functionConsoleLogs);
router.get('/:app/:faasId/console/logs/count', functionController.functionConsoleLogsCount);
router.post('/agent/logs', agentController.agentLogInsert);
router.get('/ui/logs', uiLogController.index);
router.post('/ui/logs', uiLogController.create);
router.get('/ui/logs/count', uiLogController.count);
router.get('/preHooks', preHooksController.index);
router.get('/preHooks/count', preHooksController.count);
router.get('/mfGen', mfGenController.index);
router.get('/mfGen/count', mfGenController.count);
router.get('/appCenter/:srvcid/audit', auditController.auditLog);
router.get('/appCenter/:srvcid/audit/count', auditController.auditLogCount);
router.delete('/appCenter/:srvcid/audit/purge', auditController.appcenterAuditPurge);
router.delete('/appCenter/:srvcid/log/purge', appCenterLogs.logPurge);
router.get('/appCenter/:srvcid/preHook', preHooksController.index);
router.get('/appCenter/:srvcid/preHook/count', preHookDefController.preHookLogCount);
router.get('/appCenter/:srvcid/postHook', postHookDefController.postHookLog);
router.get('/appCenter/:srvcid/postHook/count', postHookDefController.postHookLogCount);
router.get('/author/sm/log', serviceManagerController.log);
router.get('/author/sm/log/count', serviceManagerController.logCount);
router.get('/author/sm/audit', serviceManagerController.smAudit);
router.get('/author/sm/audit/count', serviceManagerController.smAuditCount);
router.get('/author/globalSchemaAudit', serviceManagerController.globalSchemaAudit);
router.get('/author/globalSchemaAudit/count', serviceManagerController.globalSchemaAuditCount);
router.get('/author/user/log', insightController.userInsight);
router.get('/author/user/log/count', insightController.userInsightCount);
router.get('/author/bot/log', insightController.botInsight);
router.get('/author/bot/log/count', insightController.botInsightCount);
router.get('/author/userRoleAudit', userManagerController.userRoleAudit);
router.get('/author/userRoleAudit/count', userManagerController.userRoleAuditCount);
router.get('/author/userDomainAudit', userManagerController.userDomainAudit);
router.get('/author/userDomainAudit/count', userManagerController.userDomainAuditCount);
router.get('/author/userAudit', userManagerController.userAudit);
router.get('/author/userAudit/count', userManagerController.userAuditCount);
router.get('/dataService/log', dataServiceController.logs);
router.get('/dataService/log/count', dataServiceController.logsCount);
router.get('/author/group/log', insightController.groupInsight);
router.get('/author/group/log/count', insightController.groupInsightCount);
router.get('/author/audit/:txnId', auditController.txnAudit);
router.delete('/author/:srvcid/audit/purge', serviceManagerController.authorAuditPurge);
router.get('/health/live', userManagerController.health);
router.get('/health/ready', userManagerController.readiness);
router.delete('/delete/:collection', serviceController.delete);
router.post('/create', serviceController.create);
router.put('/update', serviceController.update);


module.exports = router;