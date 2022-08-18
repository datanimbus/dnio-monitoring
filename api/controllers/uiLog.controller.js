'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/uiLogs.definition');
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = MakeSchema(definition);
const logger = global.logger;
var options = {
	logger: logger,
	collectionName: 'uiLogs'
};
schema.pre('save', utils.counter.getIdGenerator('UL', 'ui.Logs', null, null, 1000));
var crudder = new SMCrud( schema,'ui.Logs', options);


module.exports = {
	index: crudder.index,
	count: crudder.count,
	create: crudder.create
};