
import { apiHelper } from '../../utils/functions';
import { toast } from 'react-toastify';
import { GET_ERRORS,
    BEFORE_CUSTOMER,
    GET_CUSTOMERS,
    DELETE_CUSTOMER,
    UPSERT_CUSTOMER,
    GET_VAT,
    CUSTOMER_VERIFICATION, EXIST_CUSTOMER } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from './../../config/config';
import axios
 from 'axios';
export const beforeCustomer = () => {
    return {
        type: BEFORE_CUSTOMER
    }
}
export const createCustomer = (body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}customer/create`;
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
            toast.success(data.message)
            dispatch({
                type: UPSERT_CUSTOMER,
                payload: data.data
            })
        } else {
            dispatch({
                type: EXIST_CUSTOMER,
                payload: data.data
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
export const editCustomer = (Id, body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}customer/edit/${Id}`;
    fetch(url, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: UPSERT_CUSTOMER,
                payload: data.customer
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS,
                payload: data.data
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

export const getCustomers = (qs = '', body = {}, toastCheck = true) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}customer/list`;
    if (qs)
        url += `?${qs}`

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2

        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (!qs) {
                if (toastCheck) {
                    toast.success(data.message)
                }
            }

            dispatch({
                type: GET_CUSTOMERS,
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
export const deleteCustomer = (Id) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}customer/delete/${Id}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: DELETE_CUSTOMER,
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

export const sendVerificationEmail = (Id) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}customer/send-verification-email/${Id}`;
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: CUSTOMER_VERIFICATION
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