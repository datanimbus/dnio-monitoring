'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');


const logger = global.logger;


async function updateExistingSMAudit() {
    try {
        logger.info('=== Updating existing sm audits with app name ===');

        let filter = {
            'data.app': { '$exists': false }
        }
        let collection = mongoose.connection.db.collection('sm.audit');
        let data = await collection.find(filter).toArray();

        if (data.length > 0) {
            let serviceIds = _.map(data, e => e.data._id);
            serviceIds = _.uniq(serviceIds);
    
            // let serviceData = await global.mongoDBConfig.collection('services').find({ _id: { "$in": serviceIds} }).toArray();
            let serviceData = await global.dbAuthorConnection.collection('services').find({ _id: { "$in": serviceIds} }).toArray();
    
            let serviceObj = {};
            serviceData.map(e => serviceObj[e._id] =  e.app );
            await data.reduce(async (prev, d) => {
                await prev;
                d.data.app = serviceObj[d.data._id];
                return await collection.findOneAndUpdate({ _id: d._id }, { $set: { data: d.data } });
            }, Promise.resolve());
            logger.info('=== Updated all audits with app name ===');
        } else {
            logger.info('=== No audit records found to be updated ===');
        }
    } catch (err) {
        logger.error(err.message);
    }
}


function init() {
    return updateExistingSMAudit();
}


module.exports = init;
