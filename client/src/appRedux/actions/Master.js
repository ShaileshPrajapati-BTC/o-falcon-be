import {
    FETCH_ERROR,
    FETCH_START,
    FETCH_SUCCESS,
    LIST_DATA
} from '../../constants/ActionTypes';

import axios from 'util/Api';
import { BASE_URL } from '../../constants/Setup';

export const getList = () => {
    console.log(BASE_URL + '/master/paginate');
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        axios.post(BASE_URL + '/admin/master/paginate'
        ).then((data) => {
            console.log('/master/paginate: ', data);
            if (data.code === 'OK') {
                dispatch({ type: FETCH_SUCCESS });
                dispatch({ type: LIST_DATA, payload: data.data });
            }
            else {
                dispatch({ type: FETCH_ERROR, payload: data.error });
            }
        }).catch(function (error) {
            dispatch({ type: FETCH_ERROR, payload: error.message });
            console.log('Error****:', error.message);
        });
    };
};


export const codeConvert = (string) => {
    let removedCharString = string.replace(/[^\w-+.\\/\s]/g, '');
    removedCharString = removedCharString.trim();
    return removedCharString.replace(/\s+/g, '_').toUpperCase();
};