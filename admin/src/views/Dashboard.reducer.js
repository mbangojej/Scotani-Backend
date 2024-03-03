import { BEFORE_DASHBOARD, GET_DASHBOARD } from '../redux/types';

const initialState = {
    data: null,
    dataAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case BEFORE_DASHBOARD:
            return {
                ...state,
                data: null,
                dataAuth: false
            }
        case GET_DASHBOARD:
            return {
                ...state,
                data: action.payload,
                dataAuth: true
            }
        default:
            return {
                ...state
            }
    }
}