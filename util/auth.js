const _ = require('lodash');
const router = require('express').Router();

const { AuthCacheMW } = require('@appveen/ds-auth-cache');

const config = require('../config/config');


const logger = global.logger;

const permittedUrls = [
];

const onlyAuthUrls = [];

const internalUrls = [
	'/internal/health/live',
	'/internal/health/ready',
	'/internal/delete/:collection',
	'/create',
	'/update'
];

const adminOnlyUrls = [];

const superAdminOnlyUrls = [];

const commonUrls = [
	// '/{app}/logs',
	// '/{app}/logs/count',
	// '/{app}/appCenter/{id}/logs',
	// '/{app}/appCenter/{id}/logs/count',
	// '/{app}/preHooks',
	// '/{app}/preHooks/count',

	'/{app}/agent/logs',		//Permisssions for agent
	'/{app}/agent/logs/count',

	'/{app}/{faasId}/console/logs', 		// Faas view perms
	'/{app}/{faasId}/console/logs/count',


	'/{app}/appCenter/{srvcid}/audit',			// data service call
	'/{app}/appCenter/{srvcid}/audit/count',
	'/{app}/appCenter/{srvcid}/preHook',
	'/{app}/appCenter/{srvcid}/preHook/count',
	'/{app}/appCenter/{srvcid}/postHook',
	'/{app}/appCenter/{srvcid}/postHook/count',


	'/{app}/author/sm/log', 		// leave for now
	'/{app}/author/sm/log/count',
	'/{app}/author/globalSchemaAudit',
	'/{app}/author/globalSchemaAudit/count',
	'/{app}/author/userRoleAudit',
	'/{app}/author/userRoleAudit/count',
	'/{app}/author/userDomainAudit',
	'/{app}/author/userDomainAudit/count',
	'/{app}/author/audit/{txnId}',
	'/{app}/author/userAudit',
	'/{app}/author/userAudit/count',

	'/{app}/author/{srvcid}/audit/purge',   //Check admin permissions
	'/{app}/appCenter/{srvcid}/audit/purge',
	'/{app}/appCenter/{srvcid}/log/purge',

	'/{app}/author/sm/audit',
	'/{app}/author/sm/audit/count',
	'/{app}/hooks',
	'/{app}/hooks/count',
	'/{app}/author/user/log',
	'/{app}/author/user/log/count',
	'/{app}/author/bot/log',
	'/{app}/author/bot/log/count',
	'/{app}/dataService/log',
	'/{app}/dataService/log/count',
	'/{app}/author/group/log',
	'/{app}/author/group/log/count',
];


router.use(AuthCacheMW({ permittedUrls, secret: config.RBAC_JWT_KEY, decodeOnly: true }));

router.use((req, res, next) => {
	if (!req.locals) {
		req.locals = {};
	}
	if (req.params.app) {
		req.locals.app = req.params.app;
	} else if (req.query.app) {
		req.locals.app = req.query.app;
	} else if (req.query.filter) {
		let filter = req.query.filter;
		if (typeof filter === 'string') {
			filter = JSON.parse(filter);
		}
		req.locals.app = filter.app;
	} else if (req.body.app) {
		req.locals.app = req.body.app;
	}

	const matchingPath = commonUrls.find(e => compareURL(e, req.path));
	if (matchingPath) {
		const params = getUrlParams(matchingPath, req.path);

		if (params && params['{app}'] && !params['{app}'].match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]+$/)) {
			return next(new Error('APP_NAME_ERROR :: App name must consist of alphanumeric characters or \'-\' , and must start and end with an alphanumeric character.'));
		}

		if (req.locals.app && params && req.locals.app !== params['{app}']) {
			try {
				let app =  req.locals.app["$in"];
				if (!app.includes(params['{app}'])) {
					return next(new Error("App in url does not match with one in either body or filter."));
				}
				req.locals.app = params['{app}'];
			} catch(err) {
				logger.error(err);
				return next(new Error("App in url does not match with one in either body or filter."));
			}
		}

		if (!req.locals.app && params && params['{app}']) req.locals.app = params['{app}'];
	}

	// Check if user is an app admin or super admin.
	if (req.user) {
		if (req.locals.app) {
			const temp = (req.user.allPermissions || []).find(e => e.app === req.locals.app);
			req.user.appPermissions = temp ? temp.permissions : [];
		} else {
			req.user.appPermissions = [];
		}
		if (req.user.isSuperAdmin || (req.user.apps && req.user.apps.indexOf(req.locals.app) > -1)) {
			req.locals.skipPermissionCheck = true;
		}
	}
	next();
});


router.use((req, res, next) => {
	// Check if path required only authentication checks.
	if (_.concat(onlyAuthUrls, permittedUrls).some(e => compareURL(e, req.path))) {
		return next();
	}

	// Check if path is for internal Use.
	if (internalUrls.some(e => compareURL(e, req.path))) {
		// Some Auth check for internal URLs required.
		req.locals.skipPermissionCheck = true;
		return next();
	}

	// Check if path is allowed only to super admins.
	if (superAdminOnlyUrls.some(e => compareURL(e, req.path)) && req.user && req.user.isSuperAdmin) {
		return next();
	}

	// Check if path is allowed only to admins and super admins.
	if (adminOnlyUrls.some(e => compareURL(e, req.path)) && req.locals.skipPermissionCheck) {
		return next();
	}

	if (req.locals.app && !req.locals.app.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]+$/)) {
		return next(new Error('APP_NAME_ERROR :: App name must consist of alphanumeric characters or \'-\' , and must start and end with an alphanumeric character.'));
	}

	// All these paths required permissions check.
	if (commonUrls.some(e => compareURL(e, req.path))) {
		// Pass if user is admin or super admin.
		if (req.locals.skipPermissionCheck) {
			return next();
		}

		if (!req.locals.app) {
			res.status(400).json({ message: 'App value needed for this API' });
			return next(new Error('App value needed for this API'));
		}

		if (!req.user.isSuperAdmin && !req.user.allPermissions.find(e => e.app === req.locals.app) && !req.user.apps.includes(req.locals.app)) {
			res.status(403).json({ "message": "You don't have permissions for this app." });
			return next(new Error("You don't have permissions for this app."));
		}

		// Check if user has permission for the path.
		if (canAccessPath(req)) {
			return next();
		}
	}

	res.status(403).json({ message: 'You don\'t have access for this API' });
	return next(new Error('You don\'t have access for this API'));
});


function compareURL(tempUrl, url) {
	let tempUrlSegment = tempUrl.split('/').filter(_d => _d != '');
	let urlSegment = url.split('/').filter(_d => _d != '');
	if (tempUrlSegment.length != urlSegment.length) return false;

	tempUrlSegment.shift();
	urlSegment.shift();

	let flag = tempUrlSegment.every((_k, i) => {
		if (_k.startsWith('{') && _k.endsWith('}') && urlSegment[i] != '') return true;
		return _k === urlSegment[i];
	});
	logger.trace(`Compare URL :: ${tempUrl}, ${url} :: ${flag}`);
	return flag;
}


function getUrlParams(tempUrl, url) {
	const values = {};
	let tempUrlSegment = tempUrl.split('/').filter(_d => _d != '');
	let urlSegment = url.split('/').filter(_d => _d != '');
	tempUrlSegment.forEach((_k, i) => {
		if (_k.startsWith('{') && _k.endsWith('}') && urlSegment[i] != '') {
			values[_k] = urlSegment[i];
		}
	});
	logger.trace(`Params Map :: ${values}`);
	return values;
}


function canAccessPath(req) {
	if (compareURL('/{app}/author/sm/log', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/sm/log/count', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/globalSchemaAudit', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/globalSchemaAudit/count', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userRoleAudit', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userRoleAudit/count', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userDomainAudit', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userDomainAudit/count', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/audit/{txnId}', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userAudit', req.path)) {
		return true;
	}
	if (compareURL('/{app}/author/userAudit/count', req.path)) {
		return true;
	}


	if (compareURL('/{app}/author/{srvcid}/audit/purge', req.path) && (req.user.isSuperAdmin || req.user.apps.includes(req.path.split('/')[1]) || _.intersectionWith(req.user.appPermissions, [`ADMIN_${req.path.split('/')[3]}`], comparator).length > 0)) {
		return true;
	}
	if (compareURL('/{app}/appCenter/{srvcid}/audit/purge', req.path) && (req.user.isSuperAdmin || req.user.apps.includes(req.path.split('/')[1]) || _.intersectionWith(req.user.appPermissions, [`ADMIN_${req.path.split('/')[3]}`], comparator).length > 0)) {
		return true;
	}
	if (compareURL('/{app}/appCenter/{srvcid}/log/purge', req.path) && (req.user.isSuperAdmin || req.user.apps.includes(req.path.split('/')[1]) || _.intersectionWith(req.user.appPermissions, [`ADMIN_${req.path.split('/')[3]}`], comparator).length > 0)) {
		return true;
	}


	if (compareURL('/{app}/agent/logs', req.path) && _.intersectionWith(req.user.appPermissions, ['PVAB', 'PMABC', 'PMABU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/agent/logs/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVAB', 'PMABC', 'PMABU'], comparator).length > 0) {
		return true;
	}

	if (compareURL('/{app}/{faasId}/console/logs', req.path) && _.intersectionWith(req.user.appPermissions, ['PVF', 'PMF'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/{faasId}/console/logs/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVF', 'PMF'], comparator).length > 0) {
		return true;
	}


	if (compareURL('/{app}/appCenter/{srvcid}/audit', req.path) || compareURL('/{app}/appCenter/{srvcid}/audit/count', req.path) || compareURL('/{app}/appCenter/{srvcid}/preHook', req.path)
		|| compareURL('/{app}/appCenter/{srvcid}/preHook/count', req.path) || compareURL('/{app}/appCenter/{srvcid}/postHook', req.path) || compareURL('/{app}/appCenter/{srvcid}/postHook/count', req.path)) {

		// let baseUrl = config.get('gw');
		// let serviceId = req.path.split('/')[3];
		// let appName = req.path.split('/')[1];

		// let url = `${baseUrl}/api/c/${appName}/${serviceId}`
		return true;
	}


	if (compareURL('/{app}/author/sm/audit', req.path) && _.intersectionWith(req.user.appPermissions, ['PVDSA'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/sm/audit/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVDSA'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/hooks', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISDS'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/hooks/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISDS'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/user/log', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/user/log/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/bot/log', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/bot/log/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/dataService/log', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISDS'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/dataService/log/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISDS'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/group/log', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISG'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/author/group/log/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PVISG'], comparator).length > 0) {
		return true;
	}
	return false;
}

function comparator(main, pattern) {
	return main.startsWith(pattern);
}

module.exports = router;