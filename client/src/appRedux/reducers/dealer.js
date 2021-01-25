import { DEALER_LIST } from "../../constants/ActionTypes";

const INIT_STATE = {
    dealersList: []
};

export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case DEALER_LIST: {

            return { ...state, dealersList: action.payload };
        }
        default:
            return state;
    }
}

