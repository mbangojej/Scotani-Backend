import { toast } from 'react-toastify';
import { BEFORE_SPECIAL_PRODUCT, 
    GET_ERRORS,
    EXISTS_ROLE,
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
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeProduct = () => {
    return {
        type: BEFORE_SPECIAL_PRODUCT
    }
}

// Products
export const addProduct = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}product/create`;

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
                type: CREATE_SPECIAL_PRODUCT,
                payload: data
            })
        } else {
            dispatch({
                type: EXIST_PRODUCT,
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

export const getProduct = (faqId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}product/get/${faqId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: GET_SPECIAL_PRODUCT,
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

export const updateProduct = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}product/edit`;

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
                type: EDIT_SPECIAL_PRODUCT,
                payload: data
            })
        }  else {
            dispatch({
                type: EXIST_PRODUCT,
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

export const getProducts = (qs = '', body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}product/list`;
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
                type: GET_SPECIAL_PRODUCTS,
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

export const deleteProduct = (productId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}product/delete/${productId}`;

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
                type: DELETE_SPECIAL_PRODUCT,
                payload: data
            })
        } else if(data.type == 'exists'){
            toast.error(`${data.message}`);
            dispatch({
                type: EXISTS_ROLE,    
            })
        }else {
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

export const getVariations = (productId = null, index = null) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}product/list-variations`;
    if(productId){
        url += `/${productId}`
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: GET_PRODUCT_VARIATIONS,
                payload: { data: data, index: index }
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


export const deleteVariation = (variationId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}product/deleteVariation/${variationId}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: DELETE_PRODUCT_VARIATION,
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


export const updateVariation = (body = {}) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}product/updateVariation/`;

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
                type: EDIT_PRODUCT_VARIATION
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

// Products
export const addVariation = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}product/addVariation`;

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
                type: CREATE_VARIATION,
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
