module.exports = {
    tableName: "OperationalHours",
    attributes: {
        
        day:{
            type: "number",
            required: true,
        },

        dayName :{
            type: "string",
            required: true,  
        },

        startTime : { 
            type: 'string' ,
            required: true,
        },

        endTime :{
            type: 'string' ,
            required: true,
        },

        isOn : {
            type: 'boolean'   
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true  
        },

        franchiseeId: { 
            model: 'User' 
        },

        dealerId: { 
            model: 'User' 
        },
    }
}