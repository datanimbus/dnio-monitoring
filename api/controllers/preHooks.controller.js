'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/preHooks.definition');
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const schema = MakeSchema(definition);
const logger = global.logger;

var options = {
	logger: logger,
	collectionName: 'preHooks'
};

var crudder = new SMCrud(schema, 'preHooks', options);
module.exports = {
	index: crudder.index,
	count: crudder.count
};