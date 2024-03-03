import { BEFORE_ACTIVITY, GET_ACTIVITIES } from '../../redux/types';

const initialState = {
    activity: null,
    activityAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_ACTIVITIES:
            return {
                ...state,
                activity: action.payload,
                activityAuth: true
            }
        case BEFORE_ACTIVITY:
            return {
                ...state,
                activity: null,
                activityAuth: false
            }
        default:
            return {
                ...state
            }
    }
}