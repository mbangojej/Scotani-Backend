import { EXIST_PROMOTION,GET_PROMOTIONS, BEFORE_PROMOTION, DELETE_PROMOTION, CREATE_PROMOTION, GET_PROMOTION, EDIT_PROMOTION,DOWNLOAD_PROMOTION_REPORT,downloadPromotionReport } from '../../redux/types';

const initialState = {
    promotion: null,
    getPromotionsAuth: false,
    promotions: null,
    getPromotionAuth: false,
    delPromotionAuth: false,
    createAuth: false,
    editPromotionAuth: false,
    promotionReportAuth:false,
    existPromotionAuth: false,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_PROMOTION:
            return {
                ...state,
                promotion: action.payload.promotion,
                getPromotionAuth: true
            }
        case DOWNLOAD_PROMOTION_REPORT:
            return {
                ...state,
                fileName: action.payload.fileName,
                promotionReportAuth: true
            }
        case CREATE_PROMOTION:
            return {
                ...state,
                createAuth: true
            }
        case GET_PROMOTIONS:
            return {
                ...state,
                promotions: action.payload,
                getPromotionsAuth: true
            }
        case EDIT_PROMOTION:
            return {
                ...state,
                promotion: action.payload,
                editPromotionAuth: true
            }
            case EXIST_PROMOTION:
                return {
                    ...state,
                    promotion: action.payload,
                    existPromotionAuth: true
                }
        case DELETE_PROMOTION:
            return {
                ...state,
                promotion: action.payload,
                delPromotionAuth: true
            }
        case BEFORE_PROMOTION:
            return {
                ...state,
                promotions: null,
                promotion: null,
                delPromotionAuth: false,
                createAuth: false,
                getPromotionsAuth: false,
                getPromotionAuth: false,
                editPromotionAuth: false,
                promotionReportAuth:false,
                existPromotionAuth: false,
            }
        default:
            return {
                ...state
            }
    }
}