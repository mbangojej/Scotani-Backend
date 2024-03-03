import { toast } from 'react-toastify';
import { BEFORE_DASHBOARD, GET_DASHBOARD, GET_ERRORS } from '../redux/types';
import { emptyError } from '../redux/shared/error/error.action';
import { ENV } from '../config/config';

export const beforeDashboard = () => {
    return {
        type: BEFORE_DASHBOARD
    }
}

export const getDashboard = () => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}staff/dashboard`;

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
                type: GET_DASHBOARD,
                payload: data.data
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

