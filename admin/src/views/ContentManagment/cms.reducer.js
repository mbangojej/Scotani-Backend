import {GET_CONTENT_PAGE, GET_CONTENT_PAGES, EDIT_CONTENT_PAGE, DELETE_CONTENT_PAGE, ADD_CONTENT_PAGE, BEFORE_CONTENT} from '../../redux/types'

const initialState = {
    getContentPagesRes: {},
    getContentPagesAuth: false,

    deleteContentRes: {},
    deleteContentAuth: false,

    addContentRes : {},
    addContentAuth: false,

    getContentRes : {},
    getContentAuth: false,

    editContentRes : {},
    editContentAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_CONTENT_PAGE:
            return {
                ...state,
                getContentRes: action.payload,
                getContentAuth: true
            }
        case ADD_CONTENT_PAGE:
            return {
                ...state,
                addContentRes : action.payload,
                addContentAuth: true
            }
        case GET_CONTENT_PAGES:
            return {
                ...state,
                getContentPagesRes: action.payload,
                getContentPagesAuth: true
            }
        case EDIT_CONTENT_PAGE:
            return {
                ...state,
                editContentRes: action.payload,
                editContentAuth: true
            }
        case DELETE_CONTENT_PAGE:
            return {
                ...state,
                deleteContentRes: action.payload,
                deleteContentAuth: true
            }
        case BEFORE_CONTENT:
            return {
                ...state,
                getContentPagesRes: {},
                getContentRes: {},
                editContentRes: {},
                deleteContentRes: {},
                addContentRes: {},
                getContentPagesAuth: false,
                deleteContentAuth: false,
                addContentAuth: false,
                getContentAuth: false,
                editContentAuth: false
            }
        default:
            return {
                ...state
            }
    }
}