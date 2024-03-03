import { BEFORE_BUG_REPORT, GET_BUG_REPORTS,RESPONDED_TO_BUG_REPORT } from '../../redux/types';

const initialState = {
    bugReports: null,
    getBugReportsAuth: false,
    respondedToBugReportAuth: false,
}

export default function (state = initialState, action) {

    switch (action.type) {

        case GET_BUG_REPORTS:
            return {
                ...state,
                bugReports: action.payload,
                getBugReportsAuth: true
            }
        case RESPONDED_TO_BUG_REPORT:
            return {
                ...state,
                bugReportRespondedData: action.payload,
                respondedToBugReportAuth: true
            }
        case BEFORE_BUG_REPORT:
            return {
                ...state,
                bugReports: null,
                getBugReportsAuth: false,
                respondedToBugReportAuth:false
            }
        default:
            return {
                ...state
            }
    }
}