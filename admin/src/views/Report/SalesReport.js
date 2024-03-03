import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux'
import { ENV } from '../../config/config';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import 'rc-pagination/assets/index.css'
import Pagination from 'rc-pagination';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap"
import { Line } from "react-chartjs-2";
import Select from 'react-select';
import { beforeReport, getSalesReport } from './Report.action'
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { beforeProduct, getProducts } from '../Products/Products.action'
import { currencyFormat } from '../../../src/utils/functions'
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import './SalesReport.css'
import { Helmet } from 'react-helmet';

const SalesReport = (props) => {
    const [loader, setLoader] = useState(true)
    const [orders, setOrders] = useState([])
    const [report, setReport] = useState()
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [ordersStats, setOrdersStats] = useState()

    // Filters States
    const [customerOptions, setCustomerOptions] = useState([])
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
    const [invoiceStatusOptions, setInvoiceStatusOptions] = useState([
        {
            label: 'Select Invoice Status',
            value: '',
            key: ''
        },
        {
            label: 'Not Invoiced',
            value: '0',
            key: 0
        },
        {
            label: 'Invoiced',
            value: '1',
            key: 1
        }
    ])
    const [productOptions, setProductOptions] = useState([])

    // const [startDate, setStartDate] = useState(moment().subtract(7, 'd').format('MM-DD-YYYY'))
    // const [endDate, setEndDate] = useState(moment().format('MM-DD-YYYY'))

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [customer, setCustomer] = useState('')
    const [product, setProduct] = useState('')
    const [status, setStatus] = useState('')
    const [invoiceStatus, setInvoiceStatus] = useState('')

    const [lineChartData, setLineChartData] = useState();

    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        const filter = {}
        props.beforeReport()
        props.getSalesReport(qs, filter)
        const qsall = ENV.objectToQueryString({ all: 1, withDeleted: true })
        props.getCustomers(qsall, {})
        props.getProducts(qsall);
    }, [])

    useEffect(() => {
        if (props.report.getSalesReportAuth) {
            if (props.report.ordersStats[0]) {
                setOrdersStats(props.report.ordersStats[0])
            } else {
                setOrdersStats({ subTotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 })
            }
            setOrders(props.report.orders.orders)
            setPagination(props.report.orders.pagination)
            setPage(props.report.orders.pagination.page)
            setLimit(props.report.orders.pagination.limit)
            setReport(props.report.orders.filename)
            let data = []
            let labels = []



            props.report.orders.orderChartData.forEach((data_, index) => {
                data.push(data_.orders)
                labels.push(moment(data_.createdAt).format('MM-DD-YYYY'))
            })

            data = [...data].reverse();
            labels = [...labels].reverse();

            setLineChartData({
                labels,
                datasets: [
                    {
                        label: 'Sales',
                        data: data,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }
                ],
            })

            setLoader(false)
            props.beforeReport()
        }
    }, [props.report.getSalesReportAuth]);              // Sales Report Fetched

    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            const { customers } = props.customer
            let customersArray = [{ value: '', label: 'Select Customer' }]
            for (var key in customers) {
                let customer_ = {
                    label: `${customers[key].customername} / ${customers[key].email}`,

                    value: customers[key]._id,
                    key: key
                }
                customersArray.push(customer_)
            }
            setCustomerOptions(customersArray)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])                // Customers Fetched
    useEffect(() => {
        if (props.product.getProductsAuth) {
            const { products, pagination } = props.product.productsList
            let prodArray = [{ value: '', label: 'Select Product' }]
            products.map((prod) => {
                prodArray.push({
                    value: prod._id,
                    label: prod.title,
                })
            })
            setProductOptions(prodArray)
            props.beforeProduct()
        }
    }, [props.product.getProductsAuth])                     // Products Fetched
    const options = {
        responsive: true,

        interaction: {
            mode: 'index'
        },
        plugins: {
            tooltip: {
                intersect: false,
                mode: 'index',
                backgroundColor: "gray"
            },
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sale Graph',
            },
        },
        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                    callback: function (value) { if (value % 1 === 0) { return value; } }
                }
            }
        }
    };
    const onPageChange = async (page) => {
        const filter = {}
        if (startDate) {
            filter.startDate = startDate
        }
        if (endDate) {
            filter.endDate = endDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        if (invoiceStatus) {
            filter.invoiceStatus = parseInt(invoiceStatus)
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getSalesReport(qs, filter)
    }

    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (startDate) {
            filter.startDate = startDate
        }
        if (endDate) {
            filter.endDate = endDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        if (invoiceStatus) {
            filter.invoiceStatus = parseInt(invoiceStatus)
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getSalesReport(qs, filter)
        setLoader(true)
    }
    const applyFilters = () => {
        const filter = {}
        if (startDate) {
            filter.startDate = startDate
        }
        if (endDate) {
            filter.endDate = endDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        if (invoiceStatus) {
            filter.invoiceStatus = parseInt(invoiceStatus)
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getSalesReport(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setStartDate('')
        setEndDate('')
        setCustomer('')
        setProduct('')
        setStatus('')
        setInvoiceStatus('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getSalesReport(qs, {})
        setLoader(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }

    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | Sales Report</title>
        </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy sales-reports-card filter-card custom">
                                    <Card.Header>
                                        <Row>
                                            <Col md="6">
                                                <Card.Title as="h4">
                                                    Sales Report
                                                </Card.Title>
                                            </Col>
                                            <Col md="6">
                                                <ul className="list-unstyled mb-0 float-right">
                                                    <li className="d-inline-block align-top">
                                                        <a target={orders && orders.length > 0 && "_blank"} href={orders && orders.length > 0 ? ENV.reportPath + report : "#."} className="btn-fill pull-right  ">
                                                            <Button className="btn-fill pull-right " variant="info" disabled={pagination?.total == 0}>
                                                                Download Report
                                                            </Button>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Date Range</label><br></br>



                                                    <DateRangePicker
                                                        initialSettings={{ startDate: startDate ? moment(startDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY"), endDate: endDate ? moment(endDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY") }}

                                                        onCallback={(start, end, label) => {
                                                            setStartDate(moment(start).format("MM-DD-YYYY"))
                                                            setEndDate(moment(end).format("MM-DD-YYYY"))
                                                        }}
                                                    >
                                                        <Button className="btn-fill" variant="info">
                                                            Select Date range

                                                        </Button>
                                                    </DateRangePicker>
                                                    <span className='date-info d-block mb-2'>{startDate && startDate + ' ' + endDate}</span>
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Customer</label>
                                                    {customerOptions.length > 0 ?
                                                        <Select
                                                            onKeyPress={handleKeyPress} options={customerOptions}
                                                            onChange={(event) => setCustomer(event.value)}
                                                            value={customerOptions.filter(option => option.value === customer)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Product</label>
                                                    {productOptions.length > 0 ?
                                                        <Select onKeyPress={handleKeyPress} options={productOptions}
                                                            onChange={(event) => setProduct(event.value)}
                                                            value={productOptions.filter(option => option.value === product)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Order Status</label>
                                                    {orderStatusOptions.length > 0 ?
                                                        <Select onKeyPress={handleKeyPress} options={orderStatusOptions}
                                                            onChange={(event) => setStatus(event.value)}
                                                            value={orderStatusOptions.filter(option => option.value === status)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Invoice Status</label>
                                                    {invoiceStatusOptions.length > 0 ?
                                                        <Select onKeyPress={handleKeyPress} options={invoiceStatusOptions}
                                                            onChange={(event) => setInvoiceStatus(event.value)}
                                                            value={invoiceStatusOptions.filter(option => option.value === invoiceStatus)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block ">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!startDate && !endDate && !customer && !product && !status && !invoiceStatus} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!startDate && !endDate && !customer && !product && !status && !invoiceStatus} onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className='filter-card px-4'>
                                    <Row className="mt-3">
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Total Sales</Card.Header>
                                                <Card.Body>{ordersStats && currencyFormat(ordersStats.grandTotal)}</Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Untaxed Total</Card.Header>
                                                <Card.Body>{ordersStats && currencyFormat(ordersStats.grandTotal - ordersStats.taxTotal)}</Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Total Taxes</Card.Header>
                                                <Card.Body>{ordersStats && currencyFormat(ordersStats.taxTotal)}</Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Total Refunded</Card.Header>
                                                <Card.Body>{ordersStats && currencyFormat(ordersStats.refundedAmount)}</Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Total Discount</Card.Header>
                                                <Card.Body>{ordersStats && currencyFormat(ordersStats.discountTotal)}</Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm={4}>
                                            <Card className="pb-3 table-big-boy  text-center">
                                                <Card.Header>Orders</Card.Header>
                                                <Card.Body>{pagination && pagination.total}</Card.Body>
                                            </Card>
                                        </Col>

                                        <Col sm={12}>
                                            {lineChartData &&
                                                <Line options={options} data={lineChartData}></Line>
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mt-5">
                                        <Col lg={12} sm={12}>
                                            <Card className="card-stats">
                                                <Card.Body>
                                                    <div className='d-flex align-items-center justify-content-between mb-4'>
                                                        <Card.Title>Orders</Card.Title>
                                                        <span style={{ fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                                    </div>
                                                    <div className="table-responsive">
                                                        <Table className="table-bigboy">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center serial-col">#</th>
                                                                    <th className='text-center td-actions'>Order Number</th>
                                                                    <th className="text-center td-actions">Discount</th>
                                                                    <th className='text-center td-actions'>Total</th>
                                                                    <th className='text-center td-actions'>Refunded Amount</th>
                                                                    <th className="td-actions text-center">Order Date </th>
                                                                    <th className="td-actions text-center">Status </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    orders && orders.length ?
                                                                        orders.map((item, index) => {
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td className="text-center serial-col"> {pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                                    <td className="text-center serial-col"><Link target="_blank" to={`/edit-sale/${item._id}`}>{"SC" + item.orderNumber.toString().padStart(5, 0)}</Link></td>
                                                                                    <td className="text-center serial-col"> {item.discountTotal ? currencyFormat(item.discountTotal) : currencyFormat(0)}</td>
                                                                                    <td className="text-center serial-col"> {currencyFormat(item.grandTotal)}</td>
                                                                                    <td className="text-center serial-col"> {currencyFormat(item.refundedAmount)}</td>
                                                                                    <td className="text-center serial-col"> {moment.utc(item.createdAt).format("MM-DD-YYYY")}</td>

                                                                                    <td className="text-center serial-col">
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

                                                                                </tr>
                                                                            )
                                                                        })
                                                                        :
                                                                        <tr>
                                                                            <td colSpan="9" className="text-center">
                                                                                <div className="alert alert-info" role="alert">No Report Found</div>
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
                                </Card>
                            </Col>
                        </Row>

                    </Container >
            }
        </>
    )
}
const mapStateToProps = state => ({
    report: state.report,
    customer: state.customer,
    error: state.error,
    product: state.product,

});
export default connect(mapStateToProps, { beforeReport, getSalesReport, beforeCustomer, getCustomers, beforeProduct, getProducts })(SalesReport);