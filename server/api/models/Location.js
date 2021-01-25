module.exports = {

    tableName: 'Location',
    schema: true,

    attributes: {

        // type of location, such as Country, State, City etc
        type: {
            type: 'number',
            description: sails.config.LOCATION.TYPE
        },

        name: {
            type: 'string'
        },

        // parent of location
        parentId: {
            model: 'Location',
            columnName: 'parentId'
        },

        // parent local id of location
        parentLocalId: {
            type: 'string'
        },

        // geo location of package
        // {
        //      type:'Point',
        //      coordinates:[
        //          <number>, // long
        //          <number> // lat
        //      ]
        // }
        geo: {
            type: 'json'
        },

        // local id of location for hierarchical structure
        localId: {
            type: 'string'
        },

        // sequence of local id generated
        localIdSequence: {
            type: 'number'
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true
        },

        // sorting sequence of location
        sequence: {
            type: 'number',
            defaultsTo: 0
        },

        subLocations: {
            collection: 'Location',
            via: 'parentId'
        },
    }
};




