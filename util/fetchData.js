var params = require('@appveen/swagger-mongoose-crud/swagger.params.map');
var _ = require('lodash');
let e = {};
const logger = global.logger;
var defaultFilter = {};
let mongoose = require('mongoose');

let dateField = ['_metadata.createdAt', '_metadata.lastUpdated', 'timeStamp', 'timestamp'];

function modifyDateFilter(filter, dateFlag) {
	if (filter instanceof RegExp) return filter;
	if (Array.isArray(filter)) return filter.map(_f => modifyDateFilter(_f, dateFlag));
	if (typeof filter === 'object') {
		let newFilter = {};
		Object.keys(filter).forEach(_k => {
			if (dateField.indexOf(_k) > -1) {
				newFilter[_k] = modifyDateFilter(filter[_k], true);
			} else {
				newFilter[_k] = modifyDateFilter(filter[_k], dateFlag);
			}
		});
		return newFilter;
	}
	return dateFlag ? new Date(filter) : filter;
}

e.index = function (req, res, data) {
	let txnId = req.get('TxnId');
	var colName = data;
	var reqParams = params.map(req);
	var filter = reqParams['filter'] ? reqParams.filter : {};
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Incoming filter :: ${JSON.stringify(filter)}`);

	var sort = reqParams['sort'] ? {} : {
		'_metadata.lastUpdated': -1
	};
	reqParams['sort'] ? reqParams.sort.split(',').map(el => el.split('-').length > 1 ? sort[el.split('-')[1]] = -1 : sort[el.split('-')[0]] = 1) : null;
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Sort :: ${JSON.stringify(sort)}`);
	
	var select = reqParams['select'] ? reqParams.select.split(',') : [];
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Select :: ${JSON.stringify(select)}`);
	
	var page = reqParams['page'] ? reqParams.page : 1;
	var count = reqParams['count'] ? reqParams.count : 10;
	var search = reqParams['search'] ? reqParams.search : null;
	var skip = count * (page - 1);
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Page/Count/Skip :: ${page}/${count}/${skip}`);
	var query = null;
	if (typeof filter === 'string') {
		try {
			filter = JSON.parse(filter);
			filter = FilterParse(filter);
		} catch (err) {
			logger.error(`[${txnId}] Index :: Collection-${colName} :: Failed to parse filter :: ${err.message}`);
			filter = {};
		}
	}
	filter = _.assign({}, defaultFilter, filter);
	if (filter.omit) {
		filter = _.omit(filter, this.omit);
	}
	// filter['_metadata.deleted'] = false;
	if (search) {
		filter['$text'] = { '$search': search };
	}
	if (data == 'user.logs' || data == 'group.logs' || data == 'dataService.logs' || !data.endsWith('.logs')) filter = modifyDateFilter(filter, false);
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Filter :: ${JSON.stringify(filter)}`);
	let selectObject = {};
	if (select.length) {
		for (let i = 0; i < select.length; i++) {
			if (select[i][0] == '-') {
				select[i] = select[i].substr(1);
				selectObject[select[i]] = 0;
			}
			else {
				selectObject[select[i]] = 1;
			}
		}
	}
	logger.debug(`[${txnId}] Index :: Collection-${colName} :: Select :: ${JSON.stringify(selectObject)}`);
	if (count == -1) {
		query = mongoose.connection.db.collection(colName).find(filter).project(selectObject).sort(sort).toArray();
	}
	else {
		query = mongoose.connection.db.collection(colName).find(filter).project(selectObject).skip(skip).limit(count).sort(sort).toArray();
	}
	return query
		.then(result => {
			logger.trace(`[${txnId}] Count :: Collection-${colName} :: ${result}`);
			if (result != null) return result; 
			return [];
		})
		.then((data) => res.status(200).json(data))
		.catch(err => {
			logger.error(`[${txnId}] Index :: Collection-${colName} :: ${err.message}`);
			res.status(500).send(err.message);
		});
};

e.count = function (req, res, data) {
	let txnId = req.get('TxnId');
	var colName = data;
	var reqParams = params.map(req);
	var filter = reqParams['filter'] ? reqParams.filter : {};
	logger.debug(`[${txnId}] Count :: Collection-${colName} :: Incoming filter :: ${JSON.stringify(filter)}`);

	if (typeof filter === 'string') {
		try {
			filter = JSON.parse(filter);
			filter = FilterParse(filter);
		} catch (err) {
			logger.error(`[${txnId}] Count :: Collection-${colName} :: Failed to parse filter :: ${err.message}`);
			filter = {};
		}
	}
	filter = _.assign({}, defaultFilter, filter);
	if (filter.omit) {
		filter = _.omit(filter, this.omit);
	}
	// filter['_metadata.deleted'] = false;
	if (data == 'user.logs' || data == 'group.logs' || data == 'dataService.logs' || !data.endsWith('.logs')) filter = modifyDateFilter(filter, false);
	logger.debug(`[${txnId}] Count :: Collection-${colName} :: Filter :: ${JSON.stringify(filter)}`);

	let query = mongoose.connection.db.collection(colName).countDocuments(filter);

	return query
		.then(result => {
			logger.debug(`[${txnId}] Count :: Collection-${colName} :: ${result}`);
			if (result != null) return result;
			return 0;
		})
		.then((data) => res.status(200).json(data))
		.catch(err => {
			logger.error(`[${txnId}] Count :: Collection-${colName} :: ${err.message}`);
			res.status(500).send(err.message);
		});
};

e.show = function (req, res, data) {
	var datas = data;
	var reqParams = params.map(req);
	var select = reqParams['select'] ? reqParams.select.split(',') : [];
	let selectObject = {};
	if (select.length) {
		for (let i = 0; i < select.length; i++) {
			selectObject[select[i]] = 1;
		}
	}

	mongoose.connection.db.collection(datas).find({
		'_id': reqParams['id'],
		'_metadata.deleted': false
	}).project(selectObject)
		.then(result => {
			if (result != null) {
				return result;
			}
			else {
				return '';
			}

		})
		.then((data) => {
			return res.status(200).json(data);
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).send(err.message);
		});
};




function FilterParse(filterParsed) {
	for (var key in filterParsed) {
		if (IsString(filterParsed[key])) {
			filterParsed[key] = CreateRegexp(filterParsed[key]);
		} else if (IsArray(filterParsed[key])) {
			filterParsed[key] = ResolveArray(filterParsed[key]);
		} else if (IsObject(filterParsed[key])) {
			filterParsed[key] = FilterParse(filterParsed[key]);
		}
	}
	return filterParsed;
}
function IsString(val) {
	return val && val.constructor.name === 'String';
}
function CreateRegexp(str) {
	if (str.charAt(0) === '/' &&
		str.charAt(str.length - 1) === '/') {
		var text = str.substr(1, str.length - 2).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		return new RegExp(text, 'i');
	} else {
		return str;
	}
}
function IsArray(arg) {
	return arg && arg.constructor.name === 'Array';
}
function IsObject(arg) {
	return arg && arg.constructor.name === 'Object';
}
function ResolveArray(arr) {
	for (var x = 0; x < arr.length; x++) {
		if (IsObject(arr[x])) {
			arr[x] = FilterParse(arr[x]);
		} else if (IsArray(arr[x])) {
			arr[x] = ResolveArray(arr[x]);
		} else if (IsString(arr[x])) {
			arr[x] = CreateRegexp(arr[x]);
		}
	}
	return arr;
}
module.exports = e;

