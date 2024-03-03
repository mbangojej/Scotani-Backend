import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { beforeProduct, getProducts } from '../Products/Products.action'
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { beforeSale, getOrders } from './Sale.action';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { currencyFormat, currencyLocaleFormat } from 'utils/functions';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft, faUsers, faCheckCircle, faCross, faBan } from '@fortawesome/free-solid-svg-icons'
var CryptoJS = require("crypto-js");
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet';

const Orders = (props) => {
    const history = useHistory()

    const [orders, setOrders] = useState([])
    const [ordersStats, setOrdersStats] = useState([])
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})


    const [orderNumber, setOrderNumber] = useState('')
    const [customer, setCustomer] = useState('')
    const [invoiceStatus, setInvoiceStatus] = useState('')
    const [invoiceStatusOptions, setInvoiceStatusOptions] = useState([
        {
            label: 'Select Invoice Status',
            value: ''
        },
        {
            label: 'Not Invoiced',
            value: '0'
        },
        {
            label: 'Invoiced',
            value: '1'
        }
    ])
    const [orderStatus, setOrderStatus] = useState(window.location.pathname.split('/')[3])
    const [orderStatusOptions, setOrderStatusOptions] = useState([
        {
            label: 'Select Order Status',
            value: ''
        },
        {
            label: 'Order Received',
            value: '0'
        },
        {
            label: 'Processing',
            value: '1'
        },
        {
            label: 'On The Way',
            value: '2'
        },
        {
            label: 'Delivered',
            value: '3'
        },
        {
            label: 'Cancelled',
            value: '4'
        },
    ])


    const [paymentType, setPaymentType] = useState('')
    const [paymenTypeOptions, setPaymentTypeOptions] = useState([
        {
            label: 'Select Payment Method',
            value: ''
        },
        {
            label: 'Stripe',
            value: 'Stripe'
        },
        {
            label: 'PayPal',
            value: 'PayPal'
        },
        {
            label: 'Google Pay',
            value: 'Google Pay'
        },
        {
            label: 'Apple Pay',
            value: 'Apple Pay'
        }
    ])


    const [product, setProduct] = useState()


    const [customerOptions, setCustomerOptions] = useState([])
    const [productOptions, setProductOptions] = useState([])
    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        if (orderNumber)
            filter.orderNumber = orderNumber
        if (customer)
            filter.customer = customer
        if (paymentType)
            filter.paymentMethod = paymentType
        if (invoiceStatus)
            filter.isInvoiced = invoiceStatus
        if (orderStatus == 0 || orderStatus == 1 || orderStatus == 2 || orderStatus == 3)
            filter.orderStatus = orderStatus
        if (product) {
            filter.productID = product
        }
        props.getOrders(qs, filter)
        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)

        const qsC = ENV.objectToQueryString({ all: 1, withDeleted: true })
        props.getCustomers(qsC)
        props.getProducts(qsC);

    }, [])


    useEffect(() => {
        if (props.product.getProductsAuth) {
            const { products, pagination } = props.product.productsList

            let products_ = [{ value: '', label: 'Select Product' }]
            products.forEach((product, index) => {
                products_.push({
                    label: product.title,
                    key: product._id,
                    value: product._id,

                })
            })
            setProductOptions(products_)
            props.beforeProduct()

        }
    }, [props.product.getProductsAuth])// Products Fetched

    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            const { customers, pagination } = props.customer
            let customers_ = [{ value: '', label: 'Select Customer' }]
            customers.forEach((customer, index) => {
                customers_.push({
                    label: customer.customername + ' / ' + customer.email,
                    key: customer._id,
                    value: customer._id,

                })
            })
            setCustomerOptions(customers_)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])


    // Customers Fetched
    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])                                  // Roles Fetched

    useEffect(() => {
        if (props.sale.getOrdersAuth) {
            let { orders, pagination, ordersStats } = props.sale.orders
            setOrders(orders)
            setLoader(false)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setOrdersStats(ordersStats)
            props.beforeSale()
        }
    }, [props.sale.getOrdersAuth]);                         // Orders Fetched

    const onPageChange = async (page) => {
        const filter = {}
        if (orderNumber)
            filter.orderNumber = orderNumber
        if (customer)
            filter.customer = customer
        if (paymentType)
            filter.paymentMethod = paymentType
        if (invoiceStatus)
            filter.isInvoiced = invoiceStatus
        if (orderStatus)
            filter.orderStatus = orderStatus
        if (product) {
            filter.productID = product.split('____')[0]
        }



        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getOrders(qs, filter)
    }

    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (orderNumber)
            filter.orderNumber = orderNumber
        if (customer)
            filter.customer = customer
        if (paymentType)
            filter.paymentMethod = paymentType
        if (invoiceStatus)
            filter.isInvoiced = invoiceStatus
        if (orderStatus)
            filter.orderStatus = orderStatus
        if (product) {
            filter.productID = product.split('____')[0]
        }

        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getOrders(qs, filter)
        setLoader(true)

    }


    const applyFilters = () => {
        const filter = {}
        // if (orderNumber)
        //     filter.orderNumber = orderNumber
        if (orderNumber) {
            filter.orderNumber = orderNumber.trim().replace(/^SC/, '').replace(/^0+/, '');
        }
        if (customer)
            filter.customer = customer
        if (paymentType)
            filter.paymentMethod = paymentType

        if (invoiceStatus)
            filter.isInvoiced = invoiceStatus
        if (orderStatus)
            filter.orderStatus = orderStatus

        if (product) {
            filter.productID = product.split('____')[0]
        }

        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getOrders(qs, filter)
        setLoader(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }
    const reset = () => {

        setOrderNumber('')
        setCustomer('')
        setInvoiceStatus('')
        setPaymentType('')
        setProduct('')
        setOrderStatus('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getOrders(qs, {})
        setLoader(true)
    }
    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | Orders </title>
        </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>

                        <Row className="pb-3">
                            <Col sm={12}>
                                <Card className="filter-card custom">
                                    <Card.Header>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Order Number</label>
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder='Order Number' />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Customer</label>
                                                    {customerOptions.length > 0 ?
                                                        <Select onKeyPress={handleKeyPress} options={customerOptions}
                                                            onChange={(event) => setCustomer(event.value)}
                                                            value={customerOptions.filter(option => option.value === customer)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Invoice Status</label>
                                                <Form.Group>
                                                    <Select options={invoiceStatusOptions}
                                                        onChange={(event) => setInvoiceStatus(event.value)}
                                                        value={invoiceStatusOptions.filter(option => option.value === invoiceStatus)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Payment Method</label>
                                                <Form.Group>
                                                    <Select options={paymenTypeOptions}
                                                        onChange={(event) => setPaymentType(event.value)}
                                                        value={paymenTypeOptions.filter(option => option.value === paymentType)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Order Status</label>
                                                <Form.Group>
                                                    <Select onKeyPress={handleKeyPress} options={orderStatusOptions}
                                                        onChange={(event) => setOrderStatus(event.value)}
                                                        value={orderStatusOptions.filter(option => option.value === orderStatus)}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!orderNumber && !orderStatus && !orderNumber && !customer && !invoiceStatus && !paymentType && !product} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!orderNumber && !orderStatus && !orderNumber && !customer && !invoiceStatus && !paymentType && !product} onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Card className="filter-card">
                                    <Card.Header>
                                        <div className="d-flex justify-content-end mb-2 pr-3">
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Orders</Card.Title>
                                            {
                                                permissions && permissions.addOrder &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => props.history.push(`/create-new-sale`)}>
                                                    New Order
                                                </Button>
                                            }
                                        </div>
                                    </Card.Header>

                                    <Card.Body className="table-full-width">

                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className="text-center">Order Number</th>
                                                        <th className="text-center">Customer</th>
                                                        <th className="text-center">Order Date</th>
                                                        <th className="text-center">Discount</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Refunded Amount</th>
                                                        <th className="text-center">Payment Method</th>
                                                        <th className="text-center">Status</th>
                                                        <th className="td-actions text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        orders && orders.length ?
                                                            orders.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>

                                                                        <td className="text-center">  <Link to={`/edit-sale/${item._id}`}>{"SC" + item.orderNumber.toString().padStart(5, 0)}</Link></td>

                                                                        <td className="text-center">
                                                                            {item.customer[0]?.customername + " (" + item.customer[0]?.email + ")"}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {moment.utc(item.createdAt).format("MM-DD-YYYY")}
                                                                        </td>
                                                                        <td className="text-center">
                                                                             {item.discountTotal ? currencyFormat(item.discountTotal):  currencyFormat(0)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {currencyFormat(item.grandTotal)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {currencyFormat(item.refundedAmount)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item.transactionPlatform}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {
                                                                                {
                                                                                    "0": <span bg="warning" class="badge badge-warning">Order Received</span>,
                                                                                    "1": <span bg="success" class="badge badge-success">Processing</span>,
                                                                                    "2": <span bg="danger" class="badge badge-success">On the Way</span>,
                                                                                    "3": <span bg="success" class="badge badge-success">Delivered</span>,
                                                                                    "4": <span bg="danger" class="badge badge-danger">Cancelled</span>,
                                                                                }[item?.status?.toString()]
                                                                            }
                                                                        </td>

                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                {
                                                                                    permissions && permissions.editOrder &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button"
                                                                                            variant="success" title="Edit"
                                                                                            onClick={() => props.history.push(`/edit-sale/${item._id}`)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="10" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Orders Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            {
                                                pagination &&
                                                <div className="pb-4">
                                                    <div className='d-flex align-items-center justify-content-between pagination-wrapper'>
                                                        <Pagination
                                                            className="m-3"
                                                            defaultCurrent={1}
                                                            pageSize // items per page
                                                            current={Page > pagination.pages ? pagination.pages : Page} // current active page
                                                            total={pagination.pages} // total pages
                                                            onChange={onPageChange}
                                                            locale={localeInfo}
                                                        />
                                                        <PaginationLimitSelector limit={limit} itemsPerPageChange={itemsPerPageChange} currentPage={Page} total={pagination.total} />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    sale: state.sale,
    error: state.error,
    getRoleRes: state.role.getRoleRes,
    customer: state.customer,
    product: state.product
});

export default connect(mapStateToProps, { beforeSale, getRole, getOrders, beforeCustomer, getCustomers, beforeProduct, getProducts })(Orders);