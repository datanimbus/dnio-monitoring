var definition = {
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
	'data': {
		'type': {
			'old':{
				'type':'String'
			},
			'new':{
				'type':'String'
			}
		}
	}
};
module.exports = definition;