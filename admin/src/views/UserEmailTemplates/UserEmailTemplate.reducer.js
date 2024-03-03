import { isArrowFunction } from 'typescript';
import { GET_USER_EMAIL_TYPES, BEFORE_USER_EMAIL_TEMPLATE, GET_CATEGORIES, UPSERT_CATEGORY, DELETE_CATEGORY, GET_FAQS, DELETE_USER_EMAIL_TEMPLATE, GET_USER_EMAIL_TEMPLATE, EDIT_USER_EMAIL_TEMPLATE,GET_USER_EMAIL_TEMPLATES, CREATE_USER_EMAIL_TEMPLATE } from '../../redux/types';

const initialState = {
    faqs: null,
    getUserEmailTemplatesAuth: false,
    userEmailTemplate: null,
    delUserEmailTemplateAuth: false,
    createUserEmailTemplateAuth: false,
    getUserEmailTemplateAuth: false,
    editUserEmailTemplateAuth: false,
    userEmailTypes: null,
    getUserEmailTypesAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_USER_EMAIL_TEMPLATE:
            return {
                ...state,
                getUserEmailTemplate: action.payload,
                getUserEmailTemplateAuth: true
            }
        case GET_USER_EMAIL_TYPES:
            return {
                ...state,
                userEmailTypes: action.payload,
                getUserEmailTypesAuth: true
            }
        case CREATE_USER_EMAIL_TEMPLATE:
            return {
                ...state,
                createUserEmailTemplateAuth: true
            }
        case GET_USER_EMAIL_TEMPLATES:
            return {
                ...state,
                userEmailTemplateList: action.payload,
                getUserEmailTemplatesAuth: true
            }
        case EDIT_USER_EMAIL_TEMPLATE:
            return {
                ...state,
                userEmailTemplate: action.payload,
                editUserEmailTemplateAuth: true
            }
        case DELETE_USER_EMAIL_TEMPLATE:
            return {
                ...state,
                userEmailTemplate: action.payload,
                delUserEmailTemplateAuth: true
            }
        case BEFORE_USER_EMAIL_TEMPLATE:
            return {
                ...state,
                getUserEmailTemplatesAuth: false,
                userEmailTemplate: null,
                delUserEmailTemplateAuth: false,
                createUserEmailTemplateAuth: false,
                getUserEmailTemplateAuth: false,
                editUserEmailTemplateAuth: false,
                getUserEmailTypesAuth: false
            }
        default:
            return {
                ...state
            }
    }
}