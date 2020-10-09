var definition = {
	'_id': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'type':{
		'type': 'String',
		'required': true
	},
	'message': {
		'type': 'String',
		'required': true
	},
	'stackTrace': {
		'type': 'String'
	},
	'userId':{
		'type': 'String'
	},
	'expiry': {
		'type': 'Date',
		'default':Date.now,
		'expires': parseInt(process.env.UI_LOGS_TTL) | 172800
	}
};
module.exports = definition;