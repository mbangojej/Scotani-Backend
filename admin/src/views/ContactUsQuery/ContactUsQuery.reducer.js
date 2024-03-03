import { BEFORE_CONTACTUSQUERY, GET_CONTACTUSQUERIES, UPSERT_CONTACTUSQUERY, DELETE_CONTACTUSQUERY } from '../../redux/types';

const initialState = {
    contactUsQueryId: null,
    contactUsQueries: null,
    pagination: null,
    deleteContactUsQueryAuth: false,
    upsertContactUsQueryAuth: false,
    getContactUsQueryAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case UPSERT_CONTACTUSQUERY:
            return {
                ...state,
                contactUsQuery: action.payload,
                upsertContactUsQueryAuth: true
            }
        case DELETE_CONTACTUSQUERY:
            return {
                ...state,
                contactUsQueryId: action.payload.contactUsQueryId,
                contactUsQueries: action.payload.contactUsQueries,
                deleteContactUsQueryAuth: true
            }
        case GET_CONTACTUSQUERIES:
            return {
                ...state,
                contactUsQueries: action.payload.contactUsQueries,
                pagination: action.payload.pagination,
                getContactUsQueryAuth: true
            }
        case BEFORE_CONTACTUSQUERY:
            return {
                ...state,
                contactUsQuery: null,
                contactUsQueries: null,
                pagination: null,
                deleteContactUsQueryAuth: false,
                upsertContactUsQueryAuth: false,
                getContactUsQueryAuth: false,
                contactUsQueryId: null
            }
        default:
            return {
                ...state
            }
    }
}