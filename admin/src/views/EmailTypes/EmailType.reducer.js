import { isArrowFunction } from 'typescript';
import { GET_EMAIL_TYPE, BEFORE_EMAIL_TYPE, DELETE_EMAIL_TYPE, GET_EMAIL_TYPES, EDIT_EMAIL_TYPE, CREATE_EMAIL_TYPE } from '../../redux/types';

const initialState = {
    emailType: null,
    delEmailTypeAuth: false,
    createEmailTypeAuth: false,
    getEmailTypeAuth: false,
    editEmailTypeAuth: false,
    EmailTypes: null,
    getEmailTypesAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_EMAIL_TYPE:
            return {
                ...state,
                getEmailType: action.payload,
                getEmailTypeAuth: true
            }
        case GET_EMAIL_TYPES:
            return {
                ...state,
                emailTypes: action.payload,
                getEmailTypesAuth: true
            }
        case CREATE_EMAIL_TYPE:
            return {
                ...state,
                createEmailTypeAuth: true
            }
        case EDIT_EMAIL_TYPE:
            return {
                ...state,
                emailType: action.payload,
                editEmailTypeAuth: true
            }
        case DELETE_EMAIL_TYPE:
            return {
                ...state,
                emailType: action.payload,
                delEmailTypeAuth: true
            }
        case BEFORE_EMAIL_TYPE:
            return {
                ...state,
                emailType: null,
                delEmailTypeAuth: false,
                createEmailTypeAuth: false,
                getEmailTypeAuth: false,
                editEmailTypeAuth: false,
                getEmailTypesAuth: false
            }
        default:
            return {
                ...state
            }
    }
}