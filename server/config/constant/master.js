"use strict";

module.exports = {
    service: {
        master: {
            DEFAULT_SEARCH_KEYS: ["normalizeName", "code", "description"],
            SEARCH_COMMANDS: {
                ACTIVE: "/active",
                IN_ACTIVE: "/!active",
                DEFAULT: "/default",
                LATEST: "/latest",
                SEQUENCE_ASC: "/sequenceAsc".toLowerCase(),
                SEQUENCE_DESC: "/sequenceDesc".toLowerCase(),
                NAME_ASC: "/nameAsc".toLowerCase(),
                NAME_DESC: "/nameDesc".toLowerCase()
            },
            DEFAULT_FORMAT: [
                "id",
                "name",
                "code",
                "isActive",
                "isDefault",
                "sortingSequence",
                "subMasters",
                "parentId",
                "image",
                "icon",
                "description",
                "multiLanguageData"
            ],
            INCLUDE: {
                subMasters: 'subMasters'
            }
        }

    }
};
