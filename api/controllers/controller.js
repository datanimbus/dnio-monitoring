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

let e = {};

e.uiLogList = uiLogController.index;
e.uiLogCount = uiLogController.count;
e.uiLogCreate = uiLogController.create;

e.logList = logController.index;
e.logCount = logController.count;

e.preHooksList = preHooksController.index;
e.preHooksCount = preHooksController.count;

e.mfGenList = mfGenController.index;
e.mfGenCount = mfGenController.count;

e.audit = auditController.auditLog;
e.auditCount = auditController.auditLogCount;
e.appcenterAuditPurge = auditController.appcenterAuditPurge;
e.txnAudit = auditController.txnAudit;

e.preHook = preHookDefController.preHookLog;
e.preHookCount = preHookDefController.preHookLogCount;

e.postHook = postHookDefController.postHookLog;
e.postHookCount = postHookDefController.postHookLogCount;

e.appCenterLog = appCenterLogs.appCenterLog;
e.appCenterLogCount = appCenterLogs.appCenterLogCount;
e.logPurge = appCenterLogs.logPurge;

e.smLogs = serviceManagerController.log;
e.smLogsCount = serviceManagerController.logCount;

e.smAudit = serviceManagerController.smAudit;
e.smAuditCount = serviceManagerController.smAuditCount;
e.authorAuditPurge = serviceManagerController.authorAuditPurge;

e.globalSchemaAudit = serviceManagerController.globalSchemaAudit;
e.globalSchemaAuditCount = serviceManagerController.globalSchemaAuditCount;

e.userLogs = insightController.userInsight;
e.userLogsCount = insightController.userInsightCount;
e.health = userManagerController.health;
e.readiness = userManagerController.readiness;


e.userDomainAudit = userManagerController.userDomainAudit;
e.userDomainAuditCount = userManagerController.userDomainAuditCount;

e.userRoleAudit = userManagerController.userRoleAudit;
e.userRoleAuditCount = userManagerController.userRoleAuditCount;

e.userAudit = userManagerController.userAudit;
e.userAuditCount = userManagerController.userAuditCount;

e.groupLog = insightController.groupInsight;
e.groupLogCount = insightController.groupInsightCount;

e.deleteCollection = serviceController.delete;
e.create = serviceController.create;
e.update = serviceController.update;

e.agentLog = agentController.agentLog;
e.agentLogInsert = agentController.agentLogInsert;
e.agentLogCount = agentController.agentLogCount;
e.gatewayAgentLog = agentController.gatewayAgentLog;
e.gatewayAgentLogCount = agentController.gatewayAgentLogCount;
e.EdgeGatewayAgentLog = agentController.EdgeGatewayAgentLog;
e.EdgeGatewayAgentLogCount = agentController.EdgeGatewayAgentLogCount;

e.dataServiceLog = dataServiceController.logs;
e.dataServiceLogCount = dataServiceController.logsCount;


module.exports = e;

