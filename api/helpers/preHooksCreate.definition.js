
var definition = {
	'service': {
		'type': 'String'
	},
	'docId': {
		'type': 'String'
	},
	'timestamp':{
		'type': 'Date'
	},
	'url': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'colName': {
		'type': 'String'
	},
	'data': {
		'type': {
			'old':{
				'type':'String'
			},
			'new':{
				'type':'String'
			}
		}
	},
	'comment' :{
		'type': 'String'
	},
	'status':{
		'type':'String',
		'enum':['Pending','Completed','Error']
	},
	'operation':{
		'type': 'String'
	},
	'txnId':{
		'type': 'String'
	},
	'_metadata':{
		'type': {
			'deleted':{
				'type':'Boolean',
				'default': false
			},
			'createdAt':{
				'type':'Date'
			},
			'lastUpdated':{
				'type':'Date'
			}
		}
	}
};
module.exports = definition;