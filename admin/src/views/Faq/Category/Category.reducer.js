import { BEFORE_FAQ_CATEGORY,CREATE_FAQ_CATEGORY,GET_FAQ_CATEGORY , GET_FAQ_CATEGORIES, EDIT_FAQ_CATEGORY, DELETE_FAQ_CATEGORY, EXIST_FAQ_CATEGORY} from '../../../redux/types';

const initialState = {
    FAQcategories: null,
    getFAQCategoriesAuth: false,
    FAQcategory: null,
    delFAQCategoryAuth: false,
    createFAQCategoryAuth: false,
    editFAQCategoryAuth: false,
    existFAQCategoryAuth: false
}

export default function (state = initialState, action) {
    switch (action.type) {
       
        case CREATE_FAQ_CATEGORY:
        return {
            ...state,
            createFAQCategoryAuth: true
        }
        case EXIST_FAQ_CATEGORY:
            return {
                ...state,
                FAQcategories: action.payload,
                existFAQCategoryAuth: true
            }
        case GET_FAQ_CATEGORIES:
            return {
                ...state,
                FAQcategories: action.payload,
                getFAQCategoriesAuth: true
            }
        case EDIT_FAQ_CATEGORY:
            return {
                ...state,
                FAQcategory: action.payload,
                editFAQCategoryAuth: true
            }
        case DELETE_FAQ_CATEGORY:
            return {
                ...state,
                FAQcategory: action.payload,
                delFAQCategoryAuth: true
            }
        case BEFORE_FAQ_CATEGORY:
            return {
                ...state,
                FAQcategories: null,
                getFAQCategoriesAuth: false,
                FAQcategory: null,
                delFAQCategoryAuth: false,
                createFAQCategoryAuth: false,
                editFAQCategoryAuth: false,
                existFAQCategoryAuth: false
            }
        default:
            return {
                ...state
            }
    }
}