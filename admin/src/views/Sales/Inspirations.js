import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'rc-pagination/assets/index.css';
import { Card, Form, Table, Row, Col } from "react-bootstrap"
import 'bootstrap-daterangepicker/daterangepicker.css';
import { beforeProduct, getVariations, getProducts } from '../Products/Products.action';
import InspirationsProductRow from './InspirationsProductRow'
import { getSettings, beforeSettings } from 'views/Settings/settings.action'
import { currencyFormat } from '../../utils/functions'

const Insprations = (props) => {
    let subTotal = 0
    const [orderProducts, setOrderProducts] = useState(props.orderProducts);
    const [orderData, setOrderData] = useState({
        customer: null,
        vatPercentage: null,
        status: true,
        subTotal: 0,
        taxTotal: 0,
        grandTotal: 0
    })
    useEffect(() => {
        updateOrderProducts(orderProducts)
    }, [orderProducts])

    // Add new product 
    const addProduct = () => {
        setOrderProducts([...orderProducts, {
            productId: null,
            variationId: null,
            price: 0,
            quantity: 1,
            subTotal: 0
        }])
    }
    // Update Product Row Data
    const changeOrderRow = (index, product_) => {
        let localOrderProducts = [...orderProducts];
        localOrderProducts[index] = product_
        localOrderProducts[index].subTotal = localOrderProducts[index].quantity * localOrderProducts[index].price;
        updateOrderProducts(localOrderProducts)
    }

    // Update the Products in the order
    const updateOrderProducts = (localProducts) => {
        updateOrderTotals(localProducts)
        setOrderProducts(localProducts);
        props.updateOrderProducts(localProducts)
    }

    // Remove Product 
    const removeProduct = (index) => {
        let localOrderProducts = [...orderProducts];
        localOrderProducts.splice(index, 1); // 2nd parameter means remove one item only
        updateOrderProducts(localOrderProducts)
    }

    // Order Products updated
    const updateOrderTotals = (localProducts) => {
        let total = {
            subTotal: 0,
            taxTotal: 0,
            grandTotal: 0
        }
        localProducts.map((product) => {
            let t = product.price * product.quantity;
            total.subTotal += t;
            total.taxTotal += t * orderData.vatPercentage / 100;
            total.grandTotal += t + (t * orderData.vatPercentage / 100);

        })
        setOrderData({ ...orderData, subTotal: total.subTotal.toFixed(2), taxTotal: total.taxTotal.toFixed(2), grandTotal: total.grandTotal.toFixed(2) })
    }

    return (
        <>
            {
                <>
                    <Card.Title as="h4" className="mb-2">Products</Card.Title>
                    <Row>
                        <Col md="12">
                            <Form.Group>
                                <div id="productsDiv">
                                    <Row>
                                        <Table bordered size="sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ "width": "30%" }}>Product</th>
                                                    <th style={{ "width": "10%" }}>Quantity</th>
                                                    <th style={{ "width": "10%" }}>Unit Price</th>
                                                    <th style={{ "width": "10%" }}>Sub Total</th>
                                                    {(!props.paidAmount || props.paidAmount <= 0) &&
                                                        < th style={{ "width": "10%" }}>Actions</th>
                                                    }
                                                </tr>
                                            </thead>
                                            <tbody>

                                                {props.products.length > 0 && props.orderProducts.length > 0 ?
                                                    props.orderProducts.map((orderProduct, index) => {
                                                        subTotal += parseFloat(orderProduct.subTotal)
                                                        return (
                                                            <InspirationsProductRow
                                                                key={index}
                                                                products={props.products}
                                                                product_={orderProduct}
                                                                paidAmount={props.paidAmount}
                                                                index={index}

                                                                isLast={(props.orderProducts.length - 1) == index}
                                                                changeOrderRow={changeOrderRow}
                                                                removeProduct={removeProduct}
                                                                addProduct={addProduct}
                                                            />
                                                        )
                                                    })
                                                    :
                                                    <tr>
                                                        <td colSpan="7" className="text-center">
                                                            <div className="alert alert-info cursor-button" role="alert" onClick={addProduct}>Click here to add first product </div>
                                                        </td>
                                                    </tr>
                                                }


                                            </tbody>
                                        </Table>
                                    </Row>

                                    <Row>
                                        <Col md="6" sm="6">
                                            <Table bordered className="totalsTable">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            Sub Total
                                                        </td>
                                                        <td>
                                                            {currencyFormat(subTotal)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </>

            }
        </>
    )
}

const mapStateToProps = state => ({
    product: state.product,
    error: state.error
});

export default connect(mapStateToProps, { beforeProduct, getVariations, getProducts, getSettings, beforeSettings })(Insprations);