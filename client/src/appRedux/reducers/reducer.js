import { FRANCHISEE_LIST } from "../../constants/ActionTypes";

const INIT_STATE = {
    dealerList: []
};

export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case FRANCHISEE_LIST: {
            console.log('action.payload ', action.payload)
            return { ...state, dealerList: action.payload };
        }
        default:
            return state;
    }
}

