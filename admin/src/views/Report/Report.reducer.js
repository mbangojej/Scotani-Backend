import { BEFORE_REPORT,
    GET_SALES_REPORT,
    GET_INVOICE_REPORT,
    } from '../../redux/types';

const initialState = {
    ordersStats: null,
    orders: null,
    getSalesReportAuth: false,
    getInvoiceReportAuth: null,
    report: null,
    invoices: false,
}

export default function (state = initialState, action) {


    switch (action.type) {
        case GET_SALES_REPORT:
            return {
                ...state,
                getSalesReportAuth: true,
                orders: action.payload,
                ordersStats: action.payload.ordersStats
            }
        case GET_INVOICE_REPORT:
            return {
                ...state,
                getInvoiceReportAuth: true,
                invoices: action.payload,
            }
        case BEFORE_REPORT:
            return {
                ...state,
                ordersStats: null,
                orders: null,
                getSalesReportAuth: false,
                getInvoiceReportAuth: null,
                report: null,
                invoices: false,
            }
        default:
            return {
                ...state
            }
    }
}