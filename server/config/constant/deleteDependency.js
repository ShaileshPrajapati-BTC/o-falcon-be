/*****************************************************
 * Delete Dependency                             *
 *****************************************************/
module.exports = {
    services: {
        NaturalDependencies: {
            "master": [
                {
                    "model": "master",
                    "field": "parentId",
                    "columnName": "parentId"
                }
            ]
        },
        CustomDependencies: {
            'master': []
        },
        DependenciesColumns: {
            'master': ['name'],
            'user': ['email', 'name'],
        },
        HumanizeMapper: {
            'master': 'Master',
            'user': 'User'
        }
    }
};
