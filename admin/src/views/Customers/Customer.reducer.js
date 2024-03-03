import { BEFORE_CUSTOMER,
    GET_CUSTOMERS,
    UPSERT_CUSTOMER,
    DELETE_CUSTOMER,
    CUSTOMER_VERIFICATION, EXIST_CUSTOMER} from '../../redux/types';

const initialState = {
    customer: null,
    upsertCustomerAuth: null,
    customerId: null,
    customers: null,
    deleteCustomerAuth: null,
    customers: null,
    pagination: null,
    getCustomerAuth: null,
    verificationAuth: null,
    existCustomerAuth: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case UPSERT_CUSTOMER:
            return {
                ...state,
                customer: action.payload,
                upsertCustomerAuth: true
            }
            case EXIST_CUSTOMER:
                return {
                    ...state,
                    customer: action.payload,
                    existCustomerAuth: true
                }
        case DELETE_CUSTOMER:
            return {
                ...state,
                customerId: action.payload.customerId,
                customers: action.payload.customers,
                deleteCustomerAuth: true
            }
        case GET_CUSTOMERS:
            return {
                ...state,
                customers: action.payload.customers,
                pagination: action.payload.pagination,
                getCustomerAuth: true
            }
        case CUSTOMER_VERIFICATION:
            return {
                ...state,
                verificationAuth: true,
            }
        case BEFORE_CUSTOMER:
            return {
                ...state,
                customer: null,
                upsertCustomerAuth: null,
                customerId: null,
                customers: null,
                deleteCustomerAuth: null,
                customers: null,
                pagination: null,
                getCustomerAuth: null,
                verificationAuth: null,
                existCustomerAuth: null
            }
        default:
            return {
                ...state
            }
    }
}