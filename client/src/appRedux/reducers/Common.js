import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS, CURRENT_PAGE_DATA, HIDE_MESSAGE, SHOW_MESSAGE,CATCH_MASTER_DATA } from '../../constants/ActionTypes'

const INIT_STATE = {
  error: "",
  loading: false,
  message: ''
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case FETCH_START: {
      return { ...state, error: '', message: '', loading: true };
    }
    case FETCH_SUCCESS: {
      return { ...state, error: '', message: '', loading: false };
    }
    case SHOW_MESSAGE: {
      return { ...state, error: '', message: action.payload, loading: false };
    }
    case FETCH_ERROR: {
      return { ...state, loading: false, error: action.payload, message: '' };
    }
    case HIDE_MESSAGE: {
      return { ...state, loading: false, error: '', message: '' };
    }
    case CURRENT_PAGE_DATA: {
      return { ...state, pageData: action.payload };
    }
    case CATCH_MASTER_DATA: {
      return { ...state, masterData: action.payload };
    }
    default:
      return state;
  }
}
