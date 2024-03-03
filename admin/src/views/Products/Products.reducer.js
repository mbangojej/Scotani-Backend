import { BEFORE_SPECIAL_PRODUCT,
    CREATE_SPECIAL_PRODUCT,
    GET_SPECIAL_PRODUCTS,
    EDIT_SPECIAL_PRODUCT,
    GET_SPECIAL_PRODUCT,
    DELETE_SPECIAL_PRODUCT,
    GET_PRODUCT_VARIATIONS,
    DELETE_PRODUCT_VARIATION,
    EDIT_PRODUCT_VARIATION,
    CREATE_VARIATION,
    EXIST_PRODUCT
} from '../../redux/types';

const initialState = {

    getProduct:null,
    getProductAuth:null,
    editProductAuth:null,
    productsList:null,
    getProductsAuth:null,
    createProductAuth:null,
    product:null,
    delProductAuth:null,

    variations:null,
    getVariationsAuth:null,
    addVariationsAuth:null,
    delVariationsAuth:null,
    upsertVariationsAuth:null,
    existProductAuth:null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_SPECIAL_PRODUCT:
            return {
                ...state,
                getProduct: action.payload,
                getProductAuth: true
            }
        case EDIT_SPECIAL_PRODUCT:
            return {
                ...state,
                editProductAuth: true
            }
        case GET_SPECIAL_PRODUCTS:
            return {
                ...state,
                productsList: action.payload,
                getProductsAuth: true
            }
        case CREATE_SPECIAL_PRODUCT:
            return {
                ...state,
                createProductAuth: true
            }
            case EXIST_PRODUCT:
                return {
                    ...state,
                    product: action.payload,
                    existProductAuth: true
                }
        case DELETE_SPECIAL_PRODUCT:
            return {
                ...state,
                product: action.payload,
                delProductAuth: true
            }
        case GET_PRODUCT_VARIATIONS:
            return {
                ...state,
                variations: action.payload.data.productVariations,
                product: action.payload.data.product,
                getVariationsAuth: true
            }
        case DELETE_PRODUCT_VARIATION:
            return {
                ...state,
                delVariationsAuth: true
            }
        case EDIT_PRODUCT_VARIATION:
            return {
                ...state,
                upsertVariationsAuth: true
            }
        case CREATE_VARIATION:
            return {
                ...state,
                addVariationsAuth: true
            }
        case BEFORE_SPECIAL_PRODUCT:
            return {
                ...state,
                getProduct:null,
                getProductAuth:null,
                editProductAuth:null,
                productsList:null,
                getProductsAuth:null,
                createProductAuth:null,
                product:null,
                delProductAuth:null,
                variations:null,
                addVariationsAuth:null,
                getVariationsAuth:null,
                delVariationsAuth:null,
                upsertVariationsAuth:null,
                existProductAuth:null
            }
        default:
            return {
                ...state
            }
    }
}