import {
    BEFORE_SALE,
    SELECT_PRODUCT,
    SELECT_QUANTITY,
    REMOVE_PRODUCT,
    GET_SALE_PRODUCTS,
    CEATE_SALE,
    GET_ORDERS,
    GET_ORDER,
    UPSERT_ORDER,
    UPSERT_ORDER_STATUS,
    CREATE_INVOICE,
    PAYMENT_REFUNDED,
    VALIDATE_COUPON,
    NO_VALIDATE_COUPON,
    PAYMENT_REGISTERED,
} from '../../redux/types';

const initialState = {
    products: null,
    orders: null,
    order: null,
    product: null,
    quantity: 1,
    getProductsAuth: false,
    setProductAuth: false,
    setQuantityAuth: false,
    removeProductAuth: false,
    createSaleAuth: false,
    getOrdersAuth: false,
    getOrderAuth: false,
    upsertOrderAuth: false,
    upsertOrderStatusAuth: false,
    generateInvoiceAuth: false,
    paymentRefundedAuth: false,
    validateCouponAuth: false,
    noValidateCouponAuth: false,
    paymentRegisterAuth: false,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case PAYMENT_REGISTERED:
            return {
                ...state,
                paymentRegisterAuth: true,
            }
        case PAYMENT_REFUNDED:
            return {
                ...state,
                paymentRefundedAuth: true,
            }
        case CREATE_INVOICE:
            return {
                ...state,
                generateInvoiceAuth: true,
            }
        case UPSERT_ORDER_STATUS:
            return {
                ...state,
                upsertOrderStatusAuth: true,
                order: action.payload.order
            }
        case UPSERT_ORDER_STATUS:
            return {
                ...state,
                upsertOrderStatusAuth: true,
                order: action.payload.order
            }
        case UPSERT_ORDER:
            return {
                ...state,
                upsertOrderAuth: true
            }
        case GET_ORDER:
            return {
                ...state,
                getOrderAuth: true,
                order: action.payload
            }
        case VALIDATE_COUPON:
            return {
                ...state,
                validateCouponAuth: true,
                coupon: action.payload
            }
        case NO_VALIDATE_COUPON:
            return {
                ...state,
                noValidateCouponAuth: true,
                coupon: action.payload
            }
        case GET_ORDERS:
            return {
                ...state,
                getOrdersAuth: true,
                orders: action.payload
            }
        case CEATE_SALE:
            return {
                ...state,
                orders: action.payload,
                createSaleAuth: true,
            }
        case GET_SALE_PRODUCTS:
            return {
                ...state,
                products: action.payload,
                getProductsAuth: true,
            }
        case SELECT_PRODUCT:
            return {
                ...state,
                product: action.payload,
                setProductAuth: true,
            }
        case SELECT_QUANTITY:
            return {
                ...state,
                quantity: action.payload,
                setQuantityAuth: true,
            }
        case REMOVE_PRODUCT:
            return {
                ...state,
                index: action.payload,
                removeProductAuth: true,
            }
        case BEFORE_SALE:
            return {
                ...state,
                products: null,
                orders: null,
                product: null,
                quantity: 1,
                setProductAuth: false,
                setQuantityAuth: false,
                getProductsAuth: false,
                removeProductAuth: false,
                createSaleAuth: false,
                getOrdersAuth: false,
                getOrderAuth: false,
                upsertOrderAuth: false,
                upsertOrderStatusAuth: false,
                generateInvoiceAuth: false,
                paymentRefundedAuth: false,
                validateCouponAuth: false,
                noValidateCouponAuth: false,
                paymentRegisterAuth: false,
            }
        default:
            return {
                ...state
            }
    }
}