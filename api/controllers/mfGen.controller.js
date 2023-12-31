'use strict';

// const mongoose = require('mongoose');
const definition = require('../helpers/mfGen.definition');
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const schema = MakeSchema(definition);
const logger = global.logger;

var options = {
	logger: logger,
	collectionName: 'microflowInteraction'
};

var crudder = new SMCrud(schema, 'microflowInteraction', options);
module.exports = {
	index: crudder.index,
	count: crudder.count
};