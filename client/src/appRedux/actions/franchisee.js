import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS, FRANCHISEE_LIST } from '../../constants/ActionTypes';
import axios from 'util/Api';
const _ = require('lodash');

export const getFranchisee = () => {
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        axios
            .post('admin/user/franchisee-list', {
                filter: {
                    addOwnUser: true,
                    isDeleted: false,
                    isActive: true
                }
            })
            .then((data) => {
                if (data.code === 'OK') {
                    let response = [{ label: 'All', value: 0 }];

                    _.each(data.data.list, (value, index) => {
                        response.push({ label: value.name, value: index + 1, type: value.id });
                    });
                    dispatch({ type: FETCH_SUCCESS });
                    dispatch({ type: FRANCHISEE_LIST, payload: response });
                    // dispatch({ type: FRANCHISEE_LIST_LENGTH, payload: response.length });
                } else {
                    console.log('payload: data.error', data.error);
                    dispatch({ type: FETCH_ERROR, payload: [] });
                }
            })
            .catch((error) => {
                dispatch({ type: FETCH_ERROR, payload: error.message });
                console.log('Error****:', error.message);
            });
    };
};
