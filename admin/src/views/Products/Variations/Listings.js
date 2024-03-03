import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeProduct, getProducts, getVariations, updateVariation, deleteVariation } from '../Products.action';
import { ENV } from '../../../config/config';
import 'rc-pagination/assets/index.css';
import { Table, OverlayTrigger, Button, Tooltip, Modal, Row, Form, Col, Card } from "react-bootstrap";
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import { currencyFormat } from 'utils/functions';
import Swal from 'sweetalert2';
import VariationListings from './VariationListings';


const Listings = (props) => {
    const [loader, setLoader] = useState(false)
    return (
        <>
            {

                loader ?
                    <FullPageLoader />
                    :
                    <Row>

                        <VariationListings productId={window.location.pathname.split('/')[3]} />

                    </Row>


            }
        </>
    )
}

const mapStateToProps = state => ({
    product: state.product,
    error: state.error
});

export default connect(mapStateToProps, { beforeProduct, getProducts, getVariations, updateVariation, deleteVariation })(Listings);