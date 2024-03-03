import { createStore, applyMiddleware, compose} from 'redux';
import rootReducer from './redux/index';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
const initialState = {};
const middleware = [thunk];

const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(
        applyMiddleware(...middleware)
        )   
);

export default store;