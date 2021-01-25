import { FRANCHISEE_LIST } from "../../constants/ActionTypes";

const INIT_STATE = {
    franchisee: []
};

export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case FRANCHISEE_LIST: {

            return { ...state, franchisee: action.payload };
        }
        default:
            return state;
    }
}

