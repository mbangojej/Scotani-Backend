import { EXIST_CATEGORY, BEFORE_CATEGORY, CREATE_CATEGORY, GET_CATEGORY, GET_CATEGORIES, EDIT_CATEGORY, DELETE_CATEGORY, GET_PARENT_CATEGORIES } from '../../../redux/types';

const initialState = {
    categories: null,
    getCategoriesAuth: false,
    category: null,
    delCategoryAuth: false,
    createAuth: false,
    getCategoriesAuth: false,
    getParentCategoriesAuth: false,
    editCategoryAuth: false,
    existCategoryAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {

        case CREATE_CATEGORY:
            return {
                ...state,
                createAuth: true
            }
        case GET_CATEGORIES:
            return {
                ...state,
                categories: action.payload,
                getCategoriesAuth: true
            }
        case EDIT_CATEGORY:
            return {
                ...state,
                category: action.payload,
                editCategoryAuth: true
            }
        case EXIST_CATEGORY:
            return {
                ...state,
                category: action.payload,
                existCategoryAuth: true
            }
        case DELETE_CATEGORY:
            return {
                ...state,
                category: action.payload,
                delCategoryAuth: true
            }
        case GET_PARENT_CATEGORIES:
            return {
                ...state,
                parentCategories: action.payload,
                getParentCategoriesAuth: true
            }
        case BEFORE_CATEGORY:
            return {
                ...state,
                categories: null,
                getCategoriesAuth: false,
                category: null,
                delCategoryAuth: false,
                createAuth: false,
                getCategoriesAuth: false,
                getParentCategoriesAuth: false,
                editCategoryAuth: false,
                existCategoryAuth: false
            }
        default:
            return {
                ...state
            }
    }
}