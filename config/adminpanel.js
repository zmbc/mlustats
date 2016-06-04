'use strict';

module.exports.adminpanel = {
    instances: {

        players: {

            title: 'Players',
            model: 'Player',

            list: {
				limit: 300,
                fields: {
                    id: 'ID',
                    name: 'Name',
                    team: 'Team',
                    mluApiId: 'MLU API ID',
                    createdAt: 'Created',
                    updatedAt: false
                }
            }
        }
    }
};
