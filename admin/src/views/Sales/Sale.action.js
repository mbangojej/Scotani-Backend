import { toast } from 'react-toastify';
import {
    GET_ERRORS,
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
    PAYMENT_NOT_REGISTERED
} from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeSale = () => {
    return {
        type: BEFORE_SALE
    }
}

export const getProducts = (qs = '', body = {}) => dispatch => {
    dispatch(emptyError());

    dispatch({
        type: GET_SALE_PRODUCTS,
        payload: [
            {
                _id: "AVAST1",
                name: "AVAST",
                unit_price: 10,
            },
            {
                _id: "AVAST2",
                name: "AVAST2",
                unit_price: 20,
            },
            {
                _id: "AVAST3",
                name: "AVAST3",
                unit_price: 30,
            },
            {
                _id: "AVAST4",
                name: "AVAST4",
                unit_price: 40,
            },
            {
                _id: "AVAST5",
                name: "AVAST5",
                unit_price: 50,
            }
        ]
    })

};

export const selectProduct = (product, index) => dispatch => {
    dispatch({
        type: SELECT_PRODUCT,
        payload: {
            product: product,
            index: index
        }
    })
};

export const removeProduct = (index) => dispatch => {
    dispatch({
        type: REMOVE_PRODUCT,
        payload: index
    })
};

export const selectQuantity = (quantity, index) => dispatch => {
    dispatch({
        type: SELECT_QUANTITY,
        payload: {
            quantity: quantity,
            index: index
        }
    })
};


/**
 * Create Sale
 */


export const createSale = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/create`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: CEATE_SALE,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};
// Get Orders
export const getOrders = (qs = '', body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}order/list`;
    if (qs)
        url += `?${qs}`

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (!qs)
                toast.success(data.message)
            dispatch({
                type: GET_ORDERS,
                payload: data.data
            })
        } else {
            if (!qs)
                toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

// Get Order API
export const getOrder = (orderId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}order/get/${orderId}`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_ORDER,
                payload: data.order
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

export const updateSale = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/edit`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: UPSERT_ORDER,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
}
export const updateOrderStatus = (orderId, status) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/updateStatus/${orderId}/${status}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: UPSERT_ORDER_STATUS,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
}

/**
 * Generate Invoice
 * @param {*} orderId 
 * @returns 
 * 
 */
export const generateInvoice = (orderId) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/generateInvoice/${orderId}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: CREATE_INVOICE,
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
}

// Get Order API
export const getInvoice = (orderId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}order/getInvoice/${orderId}`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_ORDER,
                payload: data.invoice
            })
        } else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};

// Refund Payment API
export const refundAmount = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/refundAmount`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)

            dispatch({
                type: PAYMENT_REFUNDED,
                payload: data
            })
        } else {
            toast.error(data.message)
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
}


// Get Order API
export const validateCoupon = (body) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}order/validate/coupon`;
    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.status) {
            if (data.cart.promotionId == null) {
                toast.error("Sorry coupon requirements not met: Please review conditions and try again")
            }
           
            dispatch({
                type: VALIDATE_COUPON,
                payload: data.cart
            })
        } else {

            dispatch({
                type: NO_VALIDATE_COUPON,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            // if (data.message)
            // toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
};


// Register Payment API
export const registerPayment = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}order/registerPayment`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': ENV.Authorization,
            'Content-Type': "application/json",
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: PAYMENT_REGISTERED,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: PAYMENT_NOT_REGISTERED,
                payload: data
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS,
            payload: error
        })
    })
}
