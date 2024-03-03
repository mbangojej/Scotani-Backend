import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import 'rc-pagination/assets/index.css'
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap"
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { getSettings, beforeSettings } from 'views/Settings/settings.action'
import { beforeSale, getOrder, updateSale, updateOrderStatus, generateInvoice, validateCoupon, refundAmount } from './Sale.action'
import { ENV } from '../../config/config'
import { currencyFormat } from '../../../src/utils/functions'
import { getDesignImprints } from '../DesignImprints/DesignImprint.action';
import { beforeProduct, getProducts, getVariations } from '../Products/Products.action';
import moment from 'moment';
import Inspirations from './Inspirations'
import Tattoos from './Tattoos'
import { getSizeGroups, beforeSizeGroup } from 'views/SizeGroups/SizeGroup.action'
import { beforePromotion, getPromotions } from '../Promotions/Promotions.action'
import { Helmet } from 'react-helmet';
const EditSale = (props) => {
    const [firstLoad, setFirstLoad] = useState(true)
    const [loader, setLoader] = useState(true)
    const [activeTab, setActiveTab] = useState(0);
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])
    const [productVariations, setProductVariations] = useState([])
    const [tattooProducts, setTattooProducts] = useState([])
    const [orderLoaded, setOrderLoaded] = useState(false)
    const [orderData, setOrderData] = useState({})
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderTattooProducts, setOrderTattooProducts] = useState([]);
    const [isDisableStatusBtn, setIsDisableStatusBtn] = useState(false);
    const [designImprintsOptions, setDesignImprintsOptions] = useState([]);

    const [msg, setMsg] = useState({
        customer: '',
        product: ''
    })
    const [sizeGroup, setSizeGroup] = useState([]);
    const [promotion, setPromotions] = useState([])
    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ all: 1, order: 1, withDeleted: true, withInactive: true })
        props.beforeCustomer()

        const filterCustomer = { status: "true", withDeleted: true }
        props.getCustomers(qs, filterCustomer)

        props.getDesignImprints(qs, {})

        props.getSettings()
        const filter = { status: "true" }
        props.getProducts(qs, filter);
        props.getVariations();

        const qs1 = ENV.objectToQueryString({ all: 1, withDeleted: true })
        props.getSizeGroups(qs1, {})

        const qs2 = ENV.objectToQueryString({ all: 1, withDeleted: true })
       // const promotionFilter = { isActive: true }
         const promotionFilter = {  }
        props.getPromotions(qs2, promotionFilter)

        props.getOrder(window.location.pathname.split('/')[3])

    }, [])
    useEffect(() => {
        if (props.sale.validateCouponAuth) {
            let { coupon } = props.sale
            let newGrandTotal = parseFloat(coupon.subTotal) + parseFloat(coupon.taxTotal) - parseFloat(coupon.discountTotal)
            let tempCoupon = coupon
            tempCoupon.discountTotal = coupon.discountTotal
            tempCoupon.grandTotal = newGrandTotal > 0 ? newGrandTotal.toFixed(2) : 0.00
            tempCoupon.customer = orderData.customer
            setOrderData(tempCoupon)
            props.beforeSale()
        }
    }, [props.sale.validateCouponAuth])
    useEffect(() => {
        if (props.sale.noValidateCouponAuth) {
            let temp = orderData
            temp.discountTotal = 0

            let tempGrandTotal = parseFloat(temp.taxTotal) + parseFloat(temp.subTotal)
            temp.grandTotal = tempGrandTotal.toFixed(2)
            setOrderData(temp)
            props.beforeSale()
        }
    }, [props.sale.noValidateCouponAuth])
    useEffect(() => {
        if (props.promotion.getPromotionsAuth) {
            let { promotions } = props.promotion.promotions


            let promotionsArray = [{ value: '', label: 'Select Promotion' }]
            promotions.map((promotion, key) => {
                promotionsArray.push({
                    label: promotion.name + ' ( ' + promotion.promotionCode + " )",
                    value: promotion._id,
                    key: key
                })
            })
            setPromotions(promotionsArray)
            props.beforePromotion()
        }
    }, [props.promotion.getPromotionsAuth])
    useEffect(() => {
        if (props.designImprints.getDesignImprintsAuth) {
            let { designImprints } = props.designImprints.designImprints
            let dImprints = []
            designImprints.map(di => {
                dImprints.push({
                    label: di.title,
                    value: di._id,
                    price: di.price
                })
            })
            setDesignImprintsOptions(dImprints)
        }
    }, [props.designImprints.getDesignImprintsAuth])        // Design Imprints Fetched                
    useEffect(() => {
        if (props.product.getVariationsAuth) {
            setProductVariations(props.product.variations)
        }
    }, [props.product.getVariationsAuth])            // Variations Fetched
    // Update the Products in the order
    const updateOrderProducts = (localProducts) => {
        setOrderProducts(localProducts);

        let temp = orderData;
        temp.systemProducts = localProducts
        
        let tempTotal = calculateTotal(temp)

        let body = {
            customer: tempTotal.customer,
            promotionId: tempTotal.promotionId,
            orderData: tempTotal,
            
            isEditOrder: orderData.paidAmount > 0 ? 0 : 1
        }
        if (body.promotionId && !firstLoad && body.isEditOrder==1) {
            props.validateCoupon(body)
        }
        setFirstLoad(false)

    }
    // Update the Tattoo Products in the order
    const updateOrderTattooProducts = (localProducts) => {
        setOrderTattooProducts(localProducts);
        let temp = orderData;
        temp.nonSystemProducts = localProducts
        let tempTotal = calculateTotal(temp)


        let body = {
            customer: tempTotal.customer,
            promotionId: tempTotal.promotionId,
            orderData: tempTotal,
            isEditOrder: orderData.paidAmount > 0 ? 0 : 1
        }
        if (body.promotionId && !firstLoad && body.isEditOrder==1) {
            props.validateCoupon(body)
        }
        setFirstLoad(false)

    }
    const tabData = [
        {
            label: 'System Products',
            content: <Inspirations
                paidAmount={orderData.paidAmount}
                orderProducts={orderProducts}
                products={products}
                updateOrderProducts={updateOrderProducts}
            />,
        }
    ];
    if (orderTattooProducts.length > 0) {
        tabData.push({
            label: 'Non System Products',
            content: <Tattoos
                paidAmount={orderData.paidAmount}
                sizeGroup={sizeGroup}
                orderTattooProducts={orderTattooProducts}
                products={tattooProducts}
                productVariations={productVariations}
                updateOrderTattooProducts={updateOrderTattooProducts}
                designImprintsOptions={designImprintsOptions}
            />
        });
    }
    const calculateTotal = (temp) => {
        let systemProductsTotal = 0
        temp.systemProducts.map((product) => {
            let t = product.price * product.quantity;
            systemProductsTotal += t;
        })
        let nonSystemProductsTotal = 0
        temp.nonSystemProducts.map((product, index) => {
            let t = 0;
            if (product.productId) {
                let designPrice = 0
                product.designs.map((item, index1) => {
                    temp.nonSystemProducts[index].designs[index1].quantity = item.quantity
                    temp.nonSystemProducts[index].designs[index1].price = item.price
                    designPrice += item.price * item.quantity;
                })
                t += (product.designImprintPrice + product.price + designPrice) * product.quantity;
            } else {
                product.designs.map((item, index1) => {
                    temp.nonSystemProducts[index].designs[index1].quantity = item.quantity
                    temp.nonSystemProducts[index].designs[index1].price = item.price
                    t += item.price * item.quantity;
                })
            }
            nonSystemProductsTotal += t;
        })

        let orderSubTotal = systemProductsTotal + nonSystemProductsTotal;
        let orderTaxTotal = orderSubTotal * orderData.vatPercentage / 100;

        let tempTotal = orderData;
        tempTotal.subTotal = orderSubTotal.toFixed(2)
        tempTotal.taxTotal = orderTaxTotal.toFixed(2)
        let tempGrandTotal = parseFloat(tempTotal.taxTotal) + parseFloat(tempTotal.subTotal) - parseFloat(tempTotal.discountTotal)
        tempTotal.grandTotal = tempGrandTotal.toFixed(2)
        setOrderData(tempTotal)
        return tempTotal
    }
    const handleTabClick = (index) => {
        setActiveTab(index);
    };
    useEffect(() => {
        if (props.sizeGroups.getSizeGroupsAuth) {
            let { sizeGroups } = props.sizeGroups.sizeGroups
            setSizeGroup(sizeGroups)
            // setLoader(false)
            props.beforeSizeGroup()
        }
    }, [props.sizeGroups.getSizeGroupsAuth])        // Size Groups Fetched  
    useEffect(() => {
        if (props.settings.settingsAuth) {
            if (props.settings.settings) {
                setOrderData({ ...orderData, vatPercentage: props.settings.settings.vatPercentage })
            }
            props.beforeSettings()
        }
    }, [props.settings.settingsAuth])           // Settings fetched
    useEffect(() => {
        if (props.sale.getOrderAuth) {
            let order = props.sale.order
            setOrderData({
                _id: order._id,
                orderNumber: order.orderNumber,
                promotionId: order.promotionId,
                systemProducts: order.systemProducts,
                nonSystemProducts: order.nonSystemProducts,
                customer: order.customer,
                vatPercentage: order.vatPercentage,
                status: order.status,
                subTotal: order.subTotal,
                taxTotal: order.taxTotal,
                discountTotal: order.discountTotal,
                grandTotal: order.grandTotal,
                isInvoiced: order.isInvoiced,
                paidAmount: order.paidAmount,
                createdAt: order.createdAt,
                processingDate: order.processingDate,
                onTheWayDate: order.onTheWayDate,
                deliveredDate: order.deliveredDate,
                cancelledDate: order.cancelledDate,
                refundedAmount: order.refundedAmount,
                refundedDate: order.refundedDate,
            })

            setOrderProducts(order.systemProducts)
            setOrderTattooProducts(order.nonSystemProducts)
            if (order.systemProducts.length == 0 && order.nonSystemProducts.length > 0) {
                setActiveTab(1)
            }
            props.beforeSale()
            setLoader(false)
            setOrderLoaded(true)

        }
    }, [props.sale.getOrderAuth]);              // Order Data Fetched
    useEffect(() => {
        if (props.product.getProductsAuth) {
            const products_ = props.product.productsList.products
            let productOptions = []
            let productTattooOptions = []
            products_.map((product, index) => {
                if (product.type == 0 || product.type == 1 || product.type == 2 || product.type == 4) {
                    let variations_ = []
                    product.variations.map(variation => {
                        variations_.push({
                            value: variation._id,
                            label: variation.details.map((value, vIndex) => {
                                return value.title + ':' + value.value
                            }).join(','),
                        })
                    })

                    productOptions.push({
                        label: product.title,
                        value: product._id,

                        price: product.price,
                        variations: variations_,
                        image: product.image,
                        key: index
                    })
                }
                if (product.type == 2 || product.type == 3) {
                    let variations_ = []
                    product.variations.map(variation => {
                        variations_.push({
                            value: variation._id,
                            label: variation.details.map((value, vIndex) => {
                                return value.title + ':' + value.value
                            }).join(','),
                        })
                    })

                    productTattooOptions.push({
                        label: product.title,
                        value: product._id,

                        price: product.price,
                        variations: variations_,
                        image: product.image,
                        key: index
                    })
                }
            })
            setProducts(productOptions)
            setTattooProducts(productTattooOptions)
            props.beforeProduct()
        }
    }, [props.product.getProductsAuth])         // Products fetched
    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            const { customers } = props.customer
            let customersArray = [];
            customers.map((customer, key) => {
                customersArray.push({
                    label: customer.customername + ' ( ' + customer.email + " )",
                    value: customer._id,
                    key: key
                })
            })
            setCustomers(customersArray)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])        // Customers Fetched
    useEffect(() => {
        if (props.sale.upsertOrderAuth) {
            props.beforeSale()
            setLoader(false)
            props.history.push(`/orders`)
        }
    }, [props.sale.upsertOrderAuth])            // Order updated succesfuly
    useEffect(() => {
        if (props.sale.upsertOrderStatusAuth) {

            props.getOrder(window.location.pathname.split('/')[3])
            props.beforeSale()
            setIsDisableStatusBtn(false)

        }
    }, [props.sale.upsertOrderStatusAuth])      // Order Status updated
    useEffect(() => {
        if (props.sale.generateInvoiceAuth) {
            props.beforeSale()
            setOrderData({ ...orderData, isInvoiced: props.sale.order.isInvoiced })
            props.history.push(`/invoice/${orderData._id}`)
        }
    }, [props.sale.generateInvoiceAuth]);       // Invoice Generated
    // Submit Order Form
    const submitOrderForm = () => {
        if (orderData.customer && (orderData.systemProducts.length > 0 || orderData.nonSystemProducts.length > 0)) {
            let isEdit = true;
            orderData.systemProducts && orderData.systemProducts.map((product) => {
                if (product.productId === null) {
                    setMsg({
                        product: 'Select product from list'
                    })
                    isEdit = false;
                }
            })
            orderData.nonSystemProducts && orderData.nonSystemProducts.map((product) => {
                if (product.productId === null) {
                    setMsg({
                        product: 'Select product from list'
                    })
                    isEdit = false;
                }
            })
            if (isEdit) {
                setLoader(true)
                setOrderLoaded(false)
                props.updateSale(orderData)
            }
        } else {
            setMsg({
                customer: !orderData.customer ? 'Select a customer' : '',
                product: orderData.systemProducts.length == 0 && orderData.nonSystemProducts.length == 0 ? 'Select atleast one product' : ''
            })
        }
    }
    // Change order status 
    const orderChangeStatus = (status) => {
        setIsDisableStatusBtn(true)
        setOrderLoaded(false)
        setLoader(true)
        props.updateOrderStatus(orderData._id, status)

    }
    // Create Invoice 
    const createInvoice = () => {
        setLoader(true)
        setOrderLoaded(false)
        props.generateInvoice(orderData._id)
    }
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Update Order</title>
            </Helmet>
            {
                loader && !orderLoaded ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">

                                <Card className="pb-3 table-big-boy">
                                    <Card.Header>
                                        <Row>
                                            <Col md="6">
                                                <Card.Title as="h4">
                                                    Update Order  &nbsp;
                                                    {
                                                        orderData.status != null ?
                                                            {
                                                                "0": <span bg="warning" class="badge badge-warning">Order Received</span>,
                                                                "1": <span bg="success" class="badge badge-success">Processing</span>,
                                                                "2": <span bg="danger" class="badge badge-success">On the Way</span>,
                                                                "3": <span bg="success" class="badge badge-success">Delivered</span>,
                                                                "4": <span bg="danger" class="badge badge-danger">Cancelled</span>,
                                                            }[orderData.status.toString()]
                                                            : ''
                                                    }
                                                </Card.Title>
                                            </Col>
                                            <Col md="6">
                                                <ul className="list-unstyled mb-0 float-right">

                                                    {/* Mark as Processing */}
                                                    {
                                                        orderData.status == 0 &&
                                                        <li className="d-inline-block align-top">
                                                            <Button
                                                                className="btn-fill float-right"
                                                                variant="success"
                                                                onClick={() => orderChangeStatus(1)}
                                                                disabled={isDisableStatusBtn}
                                                            >
                                                                Mark as Processing
                                                            </Button> &nbsp;
                                                        </li>
                                                    }
                                                    {/* Mark as On The Way */}
                                                    {
                                                        orderData.status == 1 &&
                                                        <li className="d-inline-block align-top">
                                                            <Button
                                                                className="btn-fill float-right"
                                                                variant="success"
                                                                onClick={() => orderChangeStatus(2)}
                                                                disabled={isDisableStatusBtn}
                                                            >
                                                                Mark as On The Way
                                                            </Button> &nbsp;
                                                        </li>
                                                    }
                                                    {/* Mark as Delivered */}
                                                    {
                                                        orderData.status == 2 &&
                                                        <li className="d-inline-block align-top">
                                                            <Button
                                                                className="btn-fill float-right"
                                                                variant="success"
                                                                onClick={() => orderChangeStatus(3)}
                                                                disabled={isDisableStatusBtn}
                                                            >
                                                                Mark as Delivered
                                                            </Button> &nbsp;
                                                        </li>
                                                    }
                                                    {
                                                        !orderData.isInvoiced &&
                                                        <li className="d-inline-block align-top">
                                                            <Button
                                                                className="btn-fill float-right"
                                                                variant="success"
                                                                onClick={() => {
                                                                    createInvoice()
                                                                }}

                                                            >
                                                                Create Invoice
                                                            </Button> &nbsp;
                                                        </li>
                                                    }
                                                    {
                                                        orderData.isInvoiced &&
                                                        <>
                                                            <li className="d-inline-block align-top">
                                                                <Link to={'/invoice/' + orderData._id} className=" pull-right" >
                                                                    <Button
                                                                        className="btn-fill float-right"
                                                                        variant="success"
                                                                    >
                                                                        View Invoice
                                                                    </Button> &nbsp;
                                                                </Link>
                                                            </li>
                                                        </>
                                                    }
                                                </ul>
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Customer<span className="text-danger"> *</span></label>

                                                    <Select options={customers}
                                                        isDisabled={orderData.paidAmount > 0 ? true : false}
                                                        onChange={(option) => {
                                                            setOrderData({ ...orderData, customer: option.value })

                                                            let body = {
                                                                customer: option.value,
                                                                promotionId: orderData.promotionId,
                                                                orderData,
                                                                isEditOrder: orderData.paidAmount > 0 ? 0 : 1
                                                            }
                                                            if (orderData.promotionId && !firstLoad) {
                                                                props.validateCoupon(body)
                                                            }

                                                        }}

                                                        value={customers.filter(option => option.value === orderData.customer)}
                                                    />

                                                    <span className={msg.customererror ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.customererror}</label>
                                                    </span>
                                                </Form.Group>

                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Promotions</label>

                                                    <Select options={promotion}
                                                        isDisabled={orderData.paidAmount > 0 ? true : false}
                                                        onChange={(option) => {
                                                            setOrderData({ ...orderData, promotionId: option.value })
                                                            let body = {
                                                                customer: orderData.customer,
                                                                promotionId: option.value,
                                                                orderData,
                                                                isEditOrder: orderData.paidAmount > 0 ? 0 : 1
                                                            }
                                                            if (!firstLoad) {
                                                                props.validateCoupon(body)
                                                            }

                                                        }
                                                        }
                                                        value={promotion.find(option => option.value === orderData.promotionId) || promotion[0]}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={2}></Col>
                                            <Col md={6}>
                                                <Table bordered>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Order Received At
                                                            </td>
                                                            <td>
                                                                {orderData.createdAt ? moment(orderData.createdAt).format("MM / DD / Y HH:mm") : "Not Available"}
                                                            </td>
                                                        </tr>
                                                        {orderData.status > 0 &&
                                                            <tr>
                                                                <td>
                                                                    Processing
                                                                </td>
                                                                <td>
                                                                    {orderData.processingDate ? moment(orderData.processingDate).format("MM / DD / Y HH:mm") : "Not Available"}
                                                                </td>
                                                            </tr>
                                                        }
                                                        {orderData.status > 1 &&
                                                            <tr>
                                                                <td>
                                                                    On The Way
                                                                </td>
                                                                <td>
                                                                    {orderData.onTheWayDate ? moment(orderData.onTheWayDate).format("MM / DD / Y HH:mm") : "Not Available"}
                                                                </td>
                                                            </tr>
                                                        }
                                                        {orderData.status > 2 &&
                                                            <tr>
                                                                <td>
                                                                    Delivered
                                                                </td>
                                                                <td>
                                                                    {orderData.deliveredDate ? moment(orderData.deliveredDate).format("MM / DD / Y HH:mm") : "Not Available"}
                                                                </td>
                                                            </tr>
                                                        }
                                                        {orderData.status == 4 &&
                                                            <tr>
                                                                <td>
                                                                    Cancelled
                                                                </td>
                                                                <td>
                                                                    {orderData.cancelledDate ? moment(orderData.cancelledDate).format("MM / DD / Y HH:mm") : "Not Available"}
                                                                </td>
                                                            </tr>
                                                        }
                                                        {orderData.refundedAmount > 0 &&
                                                            <tr style={{ color: "red" }}>
                                                                <td>
                                                                    Last Refunded At
                                                                </td>
                                                                <td>
                                                                    {orderData.refundedDate ? moment(orderData.refundedDate).format("MM / DD / Y HH:mm") : "Not Available"}
                                                                </td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>

                                        <div className="tab-header">
                                            {tabData.map((tab, index) => (
                                                <div
                                                    key={index}
                                                    className={`tab-item ${index === activeTab ? 'active' : ''}`}
                                                    onClick={() => handleTabClick(index)}
                                                >
                                                    {tab.label}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tab-content mb-2">
                                            {tabData[activeTab].content}
                                        </div>

                                        <span className={msg.product ? `` : `d-none`}>
                                            <label className="pl-1 text-danger">{msg.product}</label>
                                        </span>
                                        <Row>
                                            <Col md="6" sm="6">
                                                <Table bordered className="totalsTable">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Sub Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(orderData.subTotal)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Tax Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(orderData.taxTotal)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                Discount
                                                            </td>
                                                            <td>
                                                                {currencyFormat(orderData.discountTotal)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                Grand Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(orderData.grandTotal)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>

                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <Link to={'/orders'} className=" pull-right" >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>

                                                {orderData.paidAmount <= 0 &&
                                                    <Button
                                                        className="btn-fill float-right mt-3"
                                                        type="submit"
                                                        variant="info"
                                                        onClick={(e) => submitOrderForm()}

                                                    >
                                                        Update Order
                                                    </Button>
                                                }
                                            </Col>
                                        </Row>

                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container >
            }
        </>
    )
}
const mapStateToProps = state => ({
    promotion: state.promotion,
    sizeGroups: state.sizeGroups,
    customer: state.customer,
    sale: state.sale,
    error: state.error,
    settings: state.settings,
    getRoleRes: state.role.getRoleRes,
    product: state.product,
    designImprints: state.designImprints

});

export default connect(mapStateToProps, {
    beforeCustomer,
    getCustomers,
    beforeSale,
    getOrder,
    updateSale,
    getSettings,
    beforeSettings,
    getDesignImprints,
    updateOrderStatus,
    generateInvoice,
    beforeProduct,
    getVariations,
    getProducts,
    getSizeGroups, beforeSizeGroup,
    beforePromotion, getPromotions,
    validateCoupon,
    refundAmount
})(EditSale);