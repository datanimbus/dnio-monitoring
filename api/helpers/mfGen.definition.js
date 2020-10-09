var definition = {
	'mfId': {
		'type': 'String'
	},
	'partnerName':{
		'type': 'String'
	},
	'app': {
		'type': 'String'
	},
	'mfType': {
		'type': 'String'
	},
	'timestamp':{
		'type': 'Date'
	},
	'sourceFile': {
		'type': 'String'
	},
	'targetFile':{
		'type':'String'
	},
	'status':{
		'type': 'String',
		'enum':['Pending', 'Error', 'Success']
	},
	'diagnostics':{
		'sourceData': {'type':'String'},
		'destinationData':{'type':'String'},
		'tracing':{'type':'String'},
		'latency':{'type':'String'},
		'response':{'type':'String'},
		'logs':{'type':'String'}
	}
};
module.exports = definition;