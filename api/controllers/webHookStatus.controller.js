/*let e = {};
let config = require('../../config/config');
const requestHelper = require('../helpers/requestHelper');

e.webHookStatus = function(req, res){
	let path = req.path.endsWith('count') ? '/webHookStatus/count' : '/webHookStatus';
	let srvcid = req.swagger.params.srvcid.value;
	let filter = req.swagger.params.filter.value;
	if(filter){
		filterObject = JSON.parse(filter);
		filterObject['data.serviceId'] = srvcid;
		req.swagger.params.filter.originalValue = JSON.stringify(filterObject);
		req.swagger.params.filter.value = JSON.stringify(filterObject);
	}
	else{
		filter = {};
		filter['data.serviceId'] = srvcid;
		req.swagger.params.filter.originalValue = JSON.stringify(filter);
		req.swagger.params.filter.value = JSON.stringify(filter);
	}
	if(req.swagger.params.id && req.swagger.params.id.value){
		path+=`/${req.swagger.params.id.value}`;
		delete req.swagger.params.id;
	}
	let qs = Object.keys(req.swagger.params).reduce((prev, curr) => {
		prev[curr] = req.swagger.params[curr].value;
		return prev;
	}, {});
	let reqObj = {
		basePath : config.baseUrlNE,
		path: path,
		method: 'get',
		headers: req.headers,
		qs: qs
	};
	requestHelper.sendRequest(reqObj)
		.then(result=>{
			res.status(result.status).json(result.body);
		})
		.catch(err=>{
			res.status(500).send(err.message);
		});
};

module.exports = e;*/