import { toast } from 'react-toastify';
import { GET_ERRORS, BEFORE_BUG_REPORT, GET_BUG_REPORTS, RESPONDED_TO_BUG_REPORT } from '../../redux/types';
import { emptyError } from '../../redux/shared/error/error.action';
import { ENV } from '../../config/config';

export const beforeBugReport = () => {
    return {
        type: BEFORE_BUG_REPORT
    }
}

export const getBugReports = (qs = '', body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}bugReport/list`;
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
                type: GET_BUG_REPORTS,
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

export const respondToBugReport = (Id, body = {}) => dispatch => {
    dispatch(emptyError());
    let url = `${ENV.url}bugReport/respondToBugReport/${Id}`;
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
                type: RESPONDED_TO_BUG_REPORT,
                payload: data.contactUsQuery
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