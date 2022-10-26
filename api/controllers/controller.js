

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


router.get('/:app/logs', logController.index);
router.get('/:app/logs/count', logController.count);
router.get('/:app/appCenter/:id/logs', appCenterLogs.appCenterLog);
router.get('/:app/appCenter/:id/logs/count', appCenterLogs.appCenterLogCount);
router.get('/:app/gateway/agent/logs', agentController.gatewayAgentLog);
router.get('/:app/gateway/agent/logs/count', agentController.gatewayAgentLogCount);
router.get('/:app/edgeGateway/agent/logs', agentController.EdgeGatewayAgentLog);
router.get('/:app/edgeGateway/agent/logs/count', agentController.EdgeGatewayAgentLogCount);
router.get('/:app/agent/logs', agentController.agentLog);
router.post('/:app/agent/logs', agentController.agentLogInsert);
router.get('/:app/agent/logs/count', agentController.agentLogCount);
router.get('/:app/hooks', dataServiceController.hookLogs);
router.get('/:app/hooks/count', dataServiceController.hookLogsCount);
router.get('/:app/:faasId/console/logs', functionController.functionConsoleLogs);
router.get('/:app/:faasId/console/logs/count', functionController.functionConsoleLogsCount);
router.get('/:app/ui/logs', uiLogController.index);
router.post('/:app/ui/logs', uiLogController.create);
router.get('/:app/ui/logs/count', uiLogController.count);
router.get('/:app/preHooks', preHooksController.index);
router.get('/:app/preHooks/count', preHooksController.count);
router.get('/:app/mfGen', mfGenController.index);
router.get('/:app/mfGen/count', mfGenController.count);
router.get('/:app/appCenter/:srvcid/audit', auditController.auditLog);
router.get('/:app/appCenter/:srvcid/audit/count', auditController.auditLogCount);
router.delete('/:app/appCenter/:srvcid/audit/purge', auditController.appcenterAuditPurge);
router.delete('/:app/appCenter/:srvcid/log/purge', appCenterLogs.logPurge);
router.get('/:app/appCenter/:srvcid/preHook', preHooksController.index);
router.get('/:app/appCenter/:srvcid/preHook/count', preHookDefController.preHookLogCount);
router.get('/:app/appCenter/:srvcid/postHook', postHookDefController.postHookLog);
router.get('/:app/appCenter/:srvcid/postHook/count', postHookDefController.postHookLogCount);
router.get('/:app/author/sm/log', serviceManagerController.log);
router.get('/:app/author/sm/log/count', serviceManagerController.logCount);
router.get('/:app/author/sm/audit', serviceManagerController.smAudit);
router.get('/:app/author/sm/audit/count', serviceManagerController.smAuditCount);
router.get('/:app/author/globalSchemaAudit', serviceManagerController.globalSchemaAudit);
router.get('/:app/author/globalSchemaAudit/count', serviceManagerController.globalSchemaAuditCount);
router.get('/:app/author/user/log', insightController.userInsight);
router.get('/:app/author/user/log/count', insightController.userInsightCount);
router.get('/:app/author/bot/log', insightController.botInsight);
router.get('/:app/author/bot/log/count', insightController.botInsightCount);
router.get('/:app/author/userRoleAudit', userManagerController.userRoleAudit);
router.get('/:app/author/userRoleAudit/count', userManagerController.userRoleAuditCount);
router.get('/:app/author/userDomainAudit', userManagerController.userDomainAudit);
router.get('/:app/author/userDomainAudit/count', userManagerController.userDomainAuditCount);
router.get('/:app/author/userAudit', userManagerController.userAudit);
router.get('/:app/author/userAudit/count', userManagerController.userAuditCount);
router.get('/:app/dataService/log', dataServiceController.logs);
router.get('/:app/dataService/log/count', dataServiceController.logsCount);
router.get('/:app/author/group/log', insightController.groupInsight);
router.get('/:app/author/group/log/count', insightController.groupInsightCount);
router.get('/:app/author/audit/:txnId', auditController.txnAudit);
router.delete('/:app/author/:srvcid/audit/purge', serviceManagerController.authorAuditPurge);
router.get('/internal/health/live', userManagerController.health);
router.get('/internal/health/ready', userManagerController.readiness);
router.delete('/internal/delete/:collection', serviceController.delete);
router.post('/create', serviceController.create);
router.put('/update', serviceController.update);


module.exports = router;