import { EXIST_ROLE, ADD_ROLE, UPDATE_ROLE, DELETE_ROLE, GET_ROLE, GET_ROLES, EXISTS_ROLE, SET_LOADER_ROLE, REMOVE_LOADER_ROLE, GET_ERRORS, BEFORE_ROLE, BEFORE_PERMISSION, EMPTY_ERRORS, GET_PERMISSION } from '../../../redux/types';
import { ENV } from '../../../config/config';
import { toast } from 'react-toastify';

export const emptyError = () => {
    return {
        type: EMPTY_ERRORS
    }
}

export const beforeRole = () => {
    return {
        type: BEFORE_ROLE
    }
}

export const setLoader = () => {
    return {
        type: SET_LOADER_ROLE
    }
}

export const removeLoader = () => {
    return {
        type: REMOVE_LOADER_ROLE
    }
}

export const beforePermission = () => {
    return {
        type: BEFORE_PERMISSION
    }
}

export const addRole = (body) => dispatch => {
    dispatch(emptyError());
    dispatch(setLoader());
    fetch(ENV.url + 'role/create', {
        method: 'POST',
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
            dispatch(removeLoader());
            dispatch({
                type: ADD_ROLE,
                payload: data
            });
        } else {
            dispatch({
                type: EXIST_ROLE,
                payload: data
            })
        }
    }).catch(errors => {
        dispatch(removeLoader());
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
}

export const getRoles = (page = 1, limit = 10, query = "", all = '') => dispatch => {
    let url = `role/list?page=${page}&limit=${limit}&all=${all}`;

    if (query !== '' && query !== undefined)
        url = `role/list?page=${page}&limit=${limit}&title=${query.name}&status=${query.status}`;

    dispatch(emptyError());
    fetch(ENV.url + url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin

        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: GET_ROLES,
                payload: data
            })
        }
        else {
            let toastOptions = {};
            if (data.type && data.type === "ROLE_CHANGED") {
                toastOptions = {
                    toastId: "CHANGE_ROLE_ERROR",
                    autoClose: false
                }
            }
            toast.error(`${data.message}`, toastOptions);
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

export const getRole = (roleId) => dispatch => {
    dispatch(emptyError());
    let adminId = localStorage.getItem("adminId")
    let url = `role/get?_id=${roleId}&adminId=${adminId}`;
    fetch(ENV.url + url, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin

        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (data.admin) {
                if (!data.admin.status) {
                    toast.error(`Your account has been deactivated by the admin`);
                    localStorage.setItem('isLoggedIn', 'false');
                    // You can add code here to log the user out or redirect them to the login page.
                    localStorage.removeItem("accessToken");
                    window.location.replace('/admin');
                }
            }else{
                toast.error(`Your account has been deleted by the admin`);
                localStorage.setItem('isLoggedIn', 'false');
                // You can add code here to log the user out or redirect them to the login page.
                localStorage.removeItem("accessToken");
                window.location.replace('/admin');
            }
            dispatch({
                type: GET_ROLE,
                payload: data
            })
        } else {
            let toastOptions = {};
            if (data.type && data.type === "ROLE_CHANGED") {
                toastOptions = {
                    toastId: "CHANGE_ROLE_ERROR",
                    autoClose: false
                }
            }
            toast.error(`${data.message}`, toastOptions);
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

export const updateRole = (body) => dispatch => {
    dispatch(emptyError());
    dispatch(setLoader());
    fetch(ENV.url + 'role/edit', {
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
            dispatch(removeLoader());
            dispatch({
                type: UPDATE_ROLE,
                payload: data
            })
        } else {
            dispatch({
                type: EXIST_ROLE,
                payload: data
            })

            // let toastOptions = {};
            // if(data.type && data.type === "ROLE_CHANGED") {
            //     toastOptions = {
            //         toastId : "CHANGE_ROLE_ERROR",
            //         autoClose: false
            //     }
            // }
            // toast.error(`${data.message}`, toastOptions);
            // dispatch(removeLoader());
            // dispatch({
            //     type: GET_ERRORS,
            //     payload: data
            // })
        }
    }).catch(errors => {
        dispatch(removeLoader());
        dispatch({
            type: GET_ERRORS,
            payload: errors
        })
    })
}

export const deleteRole = (roleId) => dispatch => {
    dispatch(emptyError());
    fetch(ENV.url + 'role/delete?_id=' + roleId, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin

        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            dispatch({
                type: DELETE_ROLE,
                payload: data
            })
        } else if (data.type == 'exists') {
            toast.error(`${data.message}`);
            dispatch({
                type: EXISTS_ROLE,
            })
        } else {
            let toastOptions = {};
            if (data.type && data.type === "ROLE_CHANGED") {
                toastOptions = {
                    toastId: "CHANGE_ROLE_ERROR",
                    autoClose: false
                }
            }
            toast.error(`${data.message}`, toastOptions);
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

// export const getRolesByName = (isPartner = false) => dispatch => {
//     dispatch(emptyError());
//     fetch(ENV.url + `role/list-names?isPartner=${isPartner}`, {
//         method: 'GET',
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': ENV.Authorization,
//             'x-auth-token': ENV.x_auth_token,
//              'x-access-role': ENV.getRoleId(),
//             'x-access-token': localStorage.getItem('accessToken'),
//              'user-platform': 2 // 2 = admin

//         }
//     }).then(res => res.json()).then(data => {
//         if (data.success) {
//             dispatch({
//                 type: GET_ROLES,
//                 payload: data
//             })
//         } else {
//             let toastOptions = {};
//             if(data.type && data.type === "ROLE_CHANGED") {
//                 toastOptions = {
//                     toastId : "CHANGE_ROLE_ERROR",
//                     autoClose: false
//                 }
//             }
//             toast.error(`${data.message}`, toastOptions);
//             dispatch({
//                 type: GET_ERRORS,
//                 payload: data
//             })
//         }
//     }).catch(errors => {
//         dispatch({
//             type: GET_ERRORS,
//             payload: errors
//         })
//     })
// }

export const getPermission = (roleId) => dispatch => {
    dispatch(emptyError());
    fetch(ENV.url + 'role/get?_id=' + roleId, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': ENV.Authorization,
            'x-auth-token': ENV.x_auth_token,
            // 'x-access-role': ENV.getRoleId(),
            'x-access-token': localStorage.getItem('accessToken'),
            'user-platform': 2 // 2 = admin
        }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            if (data.role.status) {
                dispatch({
                    type: GET_PERMISSION,
                    payload: data
                })
            } else {
                let role = data.role;
                for (const key in role) {
                    const element = role[key];
                    if (element === true)
                        role[key] = false
                }
                dispatch({
                    type: GET_PERMISSION,
                    payload: {
                        role: role,
                        success: true
                    }
                })
            }
        } else {
            let toastOptions = {};
            if (data.type && data.type === "ROLE_CHANGED") {
                toastOptions = {
                    toastId: "CHANGE_ROLE_ERROR",
                    autoClose: false
                }
            }
            toast.error(`${data.message}`, toastOptions);
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