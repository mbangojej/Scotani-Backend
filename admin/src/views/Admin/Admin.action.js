import { toast } from 'react-toastify';
import {
    GET_ERRORS,
    BEFORE_ADMIN,
    LOGIN_ADMIN,
    GET_ADMIN,
    ADD_ADMIN,
    GET_ADMINS,
    DELETE_ADMIN,
    UPDATE_ADMIN,
    UPDATE_PASSWORD,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    BEFORE_USER_VERIFY,
    GET_USER_VERIFY,
    SET_PASSWORD,
    VERIFY_EMAIL,
    EXIST_ADMIN,
    VERIFY_EMAIL_SENT
} from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from './../../config/config';

export const beforeAdmin = () => {
    return {
        type: BEFORE_ADMIN
    }
}
export const login = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/login`;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (data.adminStatus) {
                localStorage.setItem("accessToken", data.data.accessToken);
                localStorage.setItem("adminId", data.data._id);
                dispatch({
                    type: LOGIN_ADMIN,
                    payload: data
                })
            }
            else {
                toast.error("You are not active. Kindly contact admin!")
                dispatch({
                    type: GET_ERRORS,
                    payload: data
                })
            }

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
export const addStaffAdmin = (body) => dispatch => {
    dispatch(emptyError());
    fetch(ENV.url + 'staff/create', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(`${data.message}`);
            dispatch({
                type: ADD_ADMIN,
                payload: data
            });
        } else {
            toast.warning(`${data.message}`);
            if (data.message === "Admin with same email already exists") {
                dispatch({
                    type: EXIST_ADMIN,
                    payload: data
                });
            }
        }
        }).catch(errors => {
            dispatch(removeloader());
            dispatch({
                type: GET_ERRORS,
                payload: errors
            })
        })
}
export const deleteAdmin = (adminId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}staff/delete/${adminId}`;

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
                type: DELETE_ADMIN,
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
export const getAdmin = (staffId) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}staff/get/${staffId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'user-platform': 2 // 2 = admin
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: GET_ADMIN,
                payload: data.admin
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
export const getStaffAdmins = (page = 1, limit = 10, query = "", adminId = "") => dispatch => {

    dispatch(emptyError());
    let url = `staff/list?page=${page}&limit=${limit}&adminId=${adminId}`;

    if (query !== '' && query !== undefined)
        url = `staff/list?page=${page}&limit=${limit}&adminId=${adminId}&name=${query.name}&email=${encodeURIComponent(query.email)}&status=${query.status}&roleId=${query.roleId}`;


    fetch(ENV.url + url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin
        },
        // body: JSON.stringify(query)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_ADMINS,
                payload: data
            })
        }
        else {
            // let toastOptions = {};
            // if(data.type && data.type === "ROLE_CHANGED") {
            //     toastOptions = {
            //         toastId : "CHANGE_ROLE_ERROR",
            //         autoClose: false
            //     }
            // }
            // toast.error(`${data.message}`, toastOptions);
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(errors => {
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
}
export const updateAdmin = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/edit`;
    fetch(url, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: UPDATE_ADMIN,
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
export const updatePassword = (body, method = 'PUT') => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/edit-password`;
    fetch(url, {
        method,
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'user-platform': 2 // 2 = admin
        },
        body
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: UPDATE_PASSWORD,
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
export const forgotPassword = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/forgot-password`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'user-platform': 2 // 2 = admin
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: FORGOT_PASSWORD,
                msg: data.message
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS
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
export const resetPassword = (body, method = 'PUT') => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/reset-password`;
    fetch(url, {
        method,
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'user-platform': 2 // 2 = admin
        },
        body
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: RESET_PASSWORD,
                payload: data.data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS
        })
    })
};
export const setPassword = (body, method = 'PUT') => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/set-password`;
    fetch(url, {
        method,
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'user-platform': 2 // 2 = admin
        },
        body
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: SET_PASSWORD,
                payload: data
            })
        } else {
            toast.error(data.message)
            dispatch({
                type: GET_ERRORS
            })
        }
    }).catch(error => {
        if (error.response && error.response.data) {
            const { data } = error.response
            if (data.message)
                toast.error(data.message)
        }
        dispatch({
            type: GET_ERRORS
        })
    })
};
export const getUserVerify = (body) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/verify-admin-password`
    fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken')
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_USER_VERIFY,
                payload: data
            })
        }
        else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(errors => {
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
};
export const verifyEmail = (adminId) => dispatch => {
    dispatch(emptyError());
    const url = `${ENV.url}staff/verifyEmail/${adminId}`
    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
        },
    }).then(res => res.json()).then(data => {
        if (data.success) {
            toast.success(data.message)
            dispatch({
                type: VERIFY_EMAIL,
                payload: data
            })
        }
        else {
            dispatch({
                type: GET_ERRORS,
                payload: data
            })
        }
    }).catch(errors => {
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
};
export const beforeVerify = () => {
    return {
        type: BEFORE_USER_VERIFY
    }
};