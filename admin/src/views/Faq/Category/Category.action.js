import { toast } from 'react-toastify';
import { GET_ERRORS, CREATE_FAQ_CATEGORY, BEFORE_FAQ_CATEGORY, GET_FAQ_CATEGORIES, EDIT_FAQ_CATEGORY, DELETE_FAQ_CATEGORY, EXIST_FAQ_CATEGORY} from '../../../redux/types';
import { emptyError } from '../../../redux/shared/error/error.action';
import { ENV } from './../../../config/config';

export const beforeFAQCategory = () => {
    return {
        type: BEFORE_FAQ_CATEGORY
    }
}

export const getFAQCategories = (qs = '', body ={}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faqCategory/list`;
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
                type: GET_FAQ_CATEGORIES,
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

export const updateFAQCategory = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}faqCategory/edit`;

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
                type: EDIT_FAQ_CATEGORY,
                payload: data
            })
        } else {
            dispatch({
                type: EXIST_FAQ_CATEGORY,
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

export const deleteFAQCategory = (categoryId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}faqCategory/delete/${categoryId}`;

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
                type: DELETE_FAQ_CATEGORY,
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

export const addFAQCategory = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}faqCategory/create`;

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
                type: CREATE_FAQ_CATEGORY,
                payload: data
            })
        } else {
            dispatch({
                type: EXIST_FAQ_CATEGORY,
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
