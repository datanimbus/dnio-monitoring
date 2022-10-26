/*let e = {};
let config = require('../../config/config');
const requestHelper = require('../helpers/requestHelper');

e.webHookStatus = function(req, res){
	let path = req.path.endsWith('count') ? '/webHookStatus/count' : '/webHookStatus';
	let srvcid = req.params.srvcid;
	let filter = req.query.filter;
	if(filter){
		filterObject = JSON.parse(filter);
		filterObject['data.serviceId'] = srvcid;
		req.query.filter.origina = JSON.stringify(filterObject);
		req.query.filter = JSON.stringify(filterObject);
	}
	else{
		filter = {};
		filter['data.serviceId'] = srvcid;
		req.query.filter.origina = JSON.stringify(filter);
		req.query.filter = JSON.stringify(filter);
	}
	if(req.params.id && req.swagger.params.id){
		path+=`/${req.params.id}`;
		delete req.swagger.params.id;
	}
	let qs = Object.keys(req.swagger.params).reduce((prev, curr) => {
		prev[curr] = req.params.curr];
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