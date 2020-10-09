'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/mfGen.definition');
const SMCrud = require('@appveen/swagger-mongoose-crud');
const schema = new mongoose.Schema(definition);
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