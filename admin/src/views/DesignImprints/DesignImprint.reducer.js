import { EXIST_DESIGNIMPRINT,GET_DESIGNIMPRINTS, BEFORE_DESIGNIMPRINT, DELETE_DESIGNIMPRINT, CREATE_DESIGNIMPRINT, GET_DESIGNIMPRINT, EDIT_DESIGNIMPRINT } from '../../redux/types';

const initialState = {
    designImprints: null,
    getDesignImprintsAuth: false,
    designImprint: null,
    delDesignImprintAuth: false,
    createAuth: false,
    getDesignImprintAuth: false,
    editDesignImprintAuth: false,
    existDesignImprintAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_DESIGNIMPRINT:
            return {
                ...state,
                designImprint: action.payload.designImprint,
                getDesignImprintAuth: true
            }
            case EXIST_DESIGNIMPRINT:
                return {
                    ...state,
                    designImprint: action.payload.designImprint,
                    existDesignImprintAuth: true
                }
        case CREATE_DESIGNIMPRINT:
            return {
                ...state,
                createAuth: true
            }
        case GET_DESIGNIMPRINTS:
            return {
                ...state,
                designImprints: action.payload,
                getDesignImprintsAuth: true
            }
        case EDIT_DESIGNIMPRINT:
            return {
                ...state,
                designImprint: action.payload,
                editDesignImprintAuth: true
            }
        case DELETE_DESIGNIMPRINT:
            return {
                ...state,
                designImprint: action.payload,
                delDesignImprintAuth: true
            }
        case BEFORE_DESIGNIMPRINT:
            return {
                ...state,
                designImprints: null,
                getDesignImprintsAuth: false,
                designImprint: null,
                delDesignImprintAuth: false,
                createAuth: false,
                getDesignImprintAuth: false,
                editDesignImprintAuth: false,
                existDesignImprintAuth: false
            }
        default:
            return {
                ...state
            }
    }
}