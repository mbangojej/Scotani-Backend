import { BEFORE_CATEGORY, GET_CATEGORIES, UPSERT_CATEGORY, DELETE_CATEGORY, GET_SIZEGROUPS, BEFORE_SIZEGROUP, DELETE_SIZEGROUP, CREATE_SIZEGROUP, GET_SIZEGROUP, EDIT_SIZEGROUP } from '../../redux/types';

const initialState = {
    sizeGroups: null,
    getSizeGroupsAuth: false,
    sizeGroup: null,
    delSizeGroupAuth: false,
    createAuth: false,
    getSizeGroupAuth: false,
    editSizeGroupAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_SIZEGROUP:
            return {
                ...state,
                sizeGroup: action.payload.sizeGroup,
                getSizeGroupAuth: true
            }
        case CREATE_SIZEGROUP:
            return {
                ...state,
                createAuth: true
            }
        case GET_SIZEGROUPS:
            return {
                ...state,
                sizeGroups: action.payload,
                getSizeGroupsAuth: true
            }
        case EDIT_SIZEGROUP:
            return {
                ...state,
                sizeGroup: action.payload,
                editSizeGroupAuth: true
            }
        case DELETE_SIZEGROUP:
            return {
                ...state,
                sizeGroup: action.payload,
                delSizeGroupAuth: true
            }
        case BEFORE_SIZEGROUP:
            return {
                ...state,
                sizeGroups: null,
                getSizeGroupsAuth: false,
                sizeGroup: null,
                delSizeGroupAuth: false,
                createAuth: false,
                getSizeGroupAuth: false,
                editSizeGroupAuth: false
            }
        default:
            return {
                ...state
            }
    }
}