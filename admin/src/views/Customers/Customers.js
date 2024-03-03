import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeCustomer, getCustomers, deleteCustomer, createCustomer, editCustomer, sendVerificationEmail } from './Customers.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import userDefaultImg from '../../assets/img/default-user-icon-13.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faUsers } from '@fortawesome/free-solid-svg-icons'
import validator from 'validator';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';

const Customers = (props) => {
    const { userId } = queryString.parse(location.search);
    const dispatch = useDispatch()
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    ///Msg
    const [profileImageMsg, setProfileImageMsg] = useState('')
    const [usernameMsg, setUsernameMsg] = useState('')
    const [emailMsg, setEmailMsg] = useState('')
    const [mobileMsg, setMobileMsg] = useState('')
    const [addressMsg, setAddressMsg] = useState('')

    const [passwordMsg, setPasswordMsg] = useState('')
    const [confirmPasswordMsg, setConfirmPasswordMsg] = useState('')
    //customer properties
    const [profileImage, setProfileImage] = useState('')
    const [customername, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [address, setAddress] = useState('')
    const [status, setStatus] = useState(true)
    const [sendNotification, setSendNotification] = useState(true)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    //address properties
    const [customerId, setCustomerId] = useState('')

    //General
    const [pagination, setPagination] = useState(null)
    const [userModal, setUserModal] = useState(false)
    const [addressModal, setAddressModal] = useState(false)
    const [modalType, setModalType] = useState(0)
    const [customers, setCustomers] = useState(null)
    const [wishListModal, setWishListModal] = useState(false)
    const [cartModal, setCartModal] = useState(false)

    const [customer, setCustomer] = useState(null)
    const [loader, setLoader] = useState(true)
    const [searchUsername, setSearchName] = useState('')
    const [searchEmail, setSearchEmail] = useState('')
    const [searchStatus, setSearchStatus] = useState('')
    const [permissions, setPermissions] = useState({})
    const [searchRequest, setSearchRequest] = useState('')

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmPassword2] = useState(false);

    const showPasswordMethod = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword)
    }
    const showConfirmPasswordMethod = (e) => {
        e.preventDefault();
        setConfirmPassword2(!showConfirmPassword)
    }

    useEffect(() => {
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })

        const filter = {}
        if (searchUsername) {
            filter.customername = searchUsername
        }
        if (searchEmail) {
            filter.email = searchEmail
        }
        if (searchStatus) {
            filter.status = searchStatus
        }
        if (searchRequest) {
            filter.accountRequest = searchRequest
        }

        window.scroll(0, 0)
        props.getCustomers(qs, filter)
    }, [])
    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            let { customers, pagination } = props.customer
            setCustomers(customers)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])
    useEffect(() => {
        if (props.customer.existCustomerAuth) {
            setLoader(false)
            setModal(1)
            let { customer } = props.customer
            setUsername(customer.customername)
            setEmail(customer.email)
            setAddress(customer.address)
            setMobile(customer.mobile)
            setStatus(customer.status)
            setSendNotification(customer.sendNotification)
            setEmailMsg("Customer email already exist")
        }
    }, [props.customer.existCustomerAuth])
    useEffect(() => {
        if (props.customer.upsertCustomerAuth) {
            const qs = ENV.objectToQueryString({ page: 1, limit: 10 })

            const filter = {}
            if (searchUsername) {
                filter.customername = searchUsername
            }
            if (searchEmail) {
                filter.email = searchEmail
            }
            if (searchStatus) {
                filter.status = searchStatus
            }
            if (searchRequest) {
                filter.accountRequest = searchRequest
            }
            window.scroll(0, 0)
            props.getCustomers(qs, filter)
        }
    }, [props.customer.upsertCustomerAuth])
    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])
    useEffect(() => {
        if (props.customer.verificationAuth) {
            props.beforeCustomer()
        }
    }, [props.customer.verificationAuth])
    useEffect(() => {
        if (props.customer.deleteCustomerAuth) {
            const filter = {}
            if (searchUsername) {
                filter.customername = searchUsername
            }
            if (searchEmail) {
                filter.email = searchEmail
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            window.scroll(0, 0)
            props.getCustomers(qs, filter)
            props.beforeCustomer()
        }
    }, [props.customer.deleteCustomerAuth])
    useEffect(() => {
        if (customers) {
            setLoader(false)
            if (userId) {
                setModal(3, userId)
            }
            if (userModal) {
                getCustomer(customerId)
            }
        }
    }, [customers])
    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])
    // customer Modal Settings Start
    const initalizeStates = () => {
        setProfileImage('')
        setUsername('')
        setEmail('')
        setMobile('')
        setAddress('')
        setStatus(true)
        setSendNotification(true)
        setPassword('')
        setConfirmPassword('')
        setProfileImageMsg('')
        setUsernameMsg('')
        setEmailMsg('')
        setMobileMsg('')
        setAddressMsg('')
        setPasswordMsg('')
        setConfirmPasswordMsg('')
    }
    // set modal type
    const setModal = (type = 0, customerId = null) => {
        initalizeStates()
        setUserModal(!userModal)
        setModalType(type)
        setLoader(false)
        // add customer
        if (type === 1) {
            let customer = {
                profileImage: '', customername: '', email: '', password: ''
            }
            setCustomer(customer)
        }
        // edit or view customer
        else if ((type === 2 || type === 3) && customerId) {
            setCustomerId(customerId)
            getCustomer(customerId)
        }
    }
    // Customer Modal Settings End
    const getCustomer = async (customerId) => {
        setLoader(true)
        const customerData = await customers.find((elem) => String(elem._id) === String(customerId))
        if (customerData) {
            setCustomer({ ...customerData })
            setProfileImage(customerData.profileImage ? customerData.profileImage : '')
            setUsername(customerData.customername ? customerData.customername : '')
            setPassword('')
            setConfirmPassword('')
            setEmail(customerData.email)
            setMobile(customerData.mobile)
            setAddress(customerData.address)
            setStatus(customerData.status)
            setSendNotification(customerData.sendNotification)
        }
        setLoader(false)
    }
    const submit = (Id) => {
        let check = true


        let trimName = customername.trim().length
        if (trimName < 3) {
            setUsernameMsg('Customer Name is required')
            check = false
        }
        if (!validator.isEmpty(customername.trim()) && customername.trim().length >= 3 && customername.trim().length <= 35) {
            setUsernameMsg('')
        } else {

            setUsernameMsg('Name charachter length must be between 3 and 35.')
            check = false

        }



        if (validator.isEmpty(email.trim())) {
            setEmailMsg('Email is Required.')
            check = false
        } else {
            if (!validator.isEmpty(email) && !validator.isEmail(email)) {
                setEmailMsg('Please enter a valid email address.')
                check = false
            }
            else { setEmailMsg('') }
        }


        if (validator.isEmpty(mobile.trim())) {
            setMobileMsg('Mobile No is Required.')
            check = false
        } else {
            const numericPhoneNo = mobile.replace(/[^0-9+]/g, '');
            if (numericPhoneNo.length < 7 || numericPhoneNo.length > 15) {
                setMobileMsg('Phone number must be between 7 and 15 digits.')
                check = false
            } else if (numericPhoneNo[0] === '0' || (numericPhoneNo[0] !== '+' && numericPhoneNo[0] === '0')) {
                setMobileMsg('Phone number cannot start with zero')
                check = false
            }
            else { setMobileMsg('') }
        }


        if (validator.isEmpty(address.trim())) {
            setAddressMsg('Address is Required.')
            check = false
        } else {

            setAddressMsg('')
        }


        if (modalType === 3) {
            if (!validator.isEmpty(password.trim())) {
                if (!validator.equals(password, confirmPassword)) {
                    setConfirmPasswordMsg('Passwords do not match')
                    check = false
                }
                else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/.test(password)) {
                    setConfirmPasswordMsg('Password must contain atleast one lower case, one upper case, one character and a number.')
                    check = false
                }
                else {
                    setConfirmPasswordMsg('')
                }
            }

        }



        if (check) {

            if (modalType === 3) { // add modal type
                setLoader(true)
                let payload = {
                    profileImage,
                    customername,
                    email,
                    mobile,
                    address,
                    status,
                    sendNotification,
                    password,
                }

                dispatch(editCustomer(Id, payload));
            }

            if (modalType === 1) { // add modal type
                setLoader(true)
                let payload = {
                    profileImage,
                    customername,
                    email,
                    mobile,
                    address,
                    status,
                    sendNotification,
                }
                dispatch(createCustomer(payload));
            }
            setUserModal(!userModal)
        }

    }
    const fileSelectHandler = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setProfileImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
    };
    const onPageChange = async (page) => {

        const filter = {}
        if (searchUsername) {
            filter.customername = searchUsername
        }
        if (searchEmail) {
            filter.email = searchEmail
        }
        if (searchStatus) {
            filter.status = searchStatus
        }
        if (searchRequest) {
            filter.accountRequest = searchRequest
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getCustomers(qs, filter, true)
    }
    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchUsername) {
            filter.customername = searchUsername
        }
        if (searchEmail) {
            filter.email = searchEmail
        }
        if (searchStatus) {
            filter.status = searchStatus
        }
        if (searchRequest) {
            filter.accountRequest = searchRequest
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getCustomers(qs, filter, true)
        setLoader(true)

    };
    const deleteCustomer = (customerId) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: 'If you delete an item, it would be permanently lost.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.value) {
                setLoader(true)
                props.deleteCustomer(customerId)
            }
        })
    }
    const applyFilters = () => {
        const filter = {}
        if (searchUsername) {
            filter.customername = searchUsername
        }
        if (searchEmail) {
            filter.email = searchEmail
        }
        if (searchStatus) {
            filter.status = searchStatus
        }
        if (searchRequest) {
            filter.accountRequest = searchRequest
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getCustomers(qs, filter)
        setLoader(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }
    const reset = () => {
        setSearchName('')
        setSearchEmail('')
        setSearchStatus('')
        setSearchRequest('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getCustomers(qs)
        setLoader(true)
    }
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Customers </title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row className="pb-3">
                            <Col sm={12}>
                                <Card className="filter-card">
                                    <Card.Header>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Name</label>
                                                    <Form.Control onKeyPress={handleKeyPress} value={searchUsername} type="text" placeholder="John" onChange={(e) => setSearchName(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Email</label>
                                                    <Form.Control onKeyPress={handleKeyPress} value={searchEmail} type="text" placeholder="john@gmail.com" onChange={(e) => setSearchEmail(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Account Deletion Requests</label>
                                                <Form.Group>
                                                    <select value={searchRequest} onKeyPress={handleKeyPress} onChange={(e) => setSearchRequest(e.target.value)}>
                                                        <option value="">Select Request</option>
                                                        <option value="Show All">Show All</option>
                                                        <option value="Show Requested">Show Requested</option>
                                                    </select>
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Status</label>
                                                <Form.Group>
                                                    <select value={searchStatus} onKeyPress={handleKeyPress} onChange={(e) => setSearchStatus(e.target.value)}>
                                                        <option value="">Select Status</option>
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!searchUsername && !searchEmail && !searchStatus && !searchRequest} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchUsername && !searchEmail && !searchStatus && !searchRequest} onClick={reset}>Reset</Button>
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
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Customers</Card.Title>
                                            {
                                                permissions && permissions.addCustomer &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setModal(1)}
                                                >
                                                    Add Customer
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
                                                        <th className="text-center">Name</th>
                                                        <th className="text-center">Email</th>
                                                        <th className="text-center">Status</th>
                                                        <th className="text-center">Created At</th>
                                                        <th className="td-actions text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        customers && customers.length ?
                                                            customers.map((cust, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                        <td className="text-center">
                                                                            {cust.customername}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {cust.email}
                                                                            {
                                                                                cust.accountDeactivationRequestDate &&  
                                                                                <span className={`deletion-request bg-danger`}><span className='lable lable-danger'> Deletion Requested</span></span>
                                                                            }
                                                                        </td>

                                                                        <td className="td-actions text-center">
                                                                            <span className={` status ${cust.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {cust.status ? 'Active' : 'Inactive'}</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-center">{moment(cust.createdAt).format('DD MMM YYYY')}</td>

                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0 d-flex">
                                                                                <li className="d-inline-block align-top">
                                                                                    <a
                                                                                        className="btn-action btn-primary"
                                                                                        type="button"
                                                                                        title="View"
                                                                                        variant="info"
                                                                                        onClick={() => setModal(2, cust._id)}
                                                                                    >
                                                                                        <i className="fas fa-eye"></i>
                                                                                    </a>
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    <a
                                                                                        className="btn-action btn-primary"
                                                                                        type="button"
                                                                                        title="View Wishlist"
                                                                                        variant="info"
                                                                                        onClick={() => {
                                                                                            setWishListModal(true)
                                                                                            setCustomer(cust)
                                                                                        }}
                                                                                    >
                                                                                        <i className="fas fa-heart"></i>
                                                                                    </a>
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    <a
                                                                                        className="btn-action btn-primary"
                                                                                        type="button"
                                                                                        title="View Cart"
                                                                                        variant="info"
                                                                                        onClick={() => {
                                                                                            setCartModal(true)
                                                                                            setCustomer(cust)
                                                                                        }}
                                                                                    >
                                                                                        <i className="fas fa-cart-plus"></i>
                                                                                    </a>
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    {
                                                                                        permissions && permissions.editCustomer &&
                                                                                        <a
                                                                                            className="btn-action btn-warning"
                                                                                            type="button"
                                                                                            title="Edit"
                                                                                            variant="info"
                                                                                            onClick={() => setModal(3, cust._id)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </a>
                                                                                    }
                                                                                    <div className="d-inline-block align-top">
                                                                                        {
                                                                                            permissions && permissions.deleteCustomer &&
                                                                                            <a
                                                                                                className="btn-action btn-danger"
                                                                                                type="button"
                                                                                                title="Delete"
                                                                                                variant="info"
                                                                                                onClick={() => deleteCustomer(cust._id)}
                                                                                            >
                                                                                                <i className="fas fa-trash"></i>
                                                                                            </a>
                                                                                        }
                                                                                    </div>
                                                                                </li>
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="7" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Customer Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <div className="pb-4">
                                                <div className='d-flex align-items-center justify-content-between pagination-wrapper'>
                                                    {pagination &&
                                                        <Pagination
                                                            className="m-3"
                                                            defaultCurrent={1}
                                                            pageSize // items per page
                                                            current={Page > pagination.pages ? pagination.pages : Page} // current active page
                                                            total={pagination.pages} // total pages
                                                            onChange={onPageChange}
                                                            locale={localeInfo}
                                                        />
                                                    }

                                                    <PaginationLimitSelector limit={limit} itemsPerPageChange={itemsPerPageChange} currentPage={Page} total={pagination.total} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {/*  */}
                        {/*Customer WishList View Model*/}
                        {/*  */}
                        {
                            wishListModal && customer &&
                            <Modal className="modal-primary" onHide={() => setWishListModal(false)} show={wishListModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                Wish List for {customer.customername}
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <Form.Group className="flex-fill d-flex align-items-center">
                                            <ul className="text-white">
                                                {
                                                    customer.wishlists.length > 0 ? customer.wishlists.map((w, i) => {
                                                        return (
                                                            <li key={i}>
                                                                {w.product.title}
                                                            </li>
                                                        )
                                                    }) :
                                                        <li>
                                                            Nothing in the list
                                                        </li>
                                                }
                                            </ul>
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-info" onClick={() => setWishListModal(false)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                        {/*  */}
                        {/*Customer Cart View Model*/}
                        {/*  */}
                        {
                            cartModal && customer &&
                            <Modal size="lg" className="modal-primary" onHide={() => setCartModal(false)} show={cartModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                Cart for {customer.customername}
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <p><strong>System Products</strong></p>
                                    <div className="table-responsive">
                                        <Table className="table-bigboy">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Image</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Discount</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {

                                                    customer.cart[0] && customer.cart[0].systemProducts && customer.cart[0].systemProducts.length > 0 ? (
                                                        customer.cart[0].systemProducts?.map((prod, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{prod.productName}</td>
                                                                    <td><img src={prod.productImage} style={{ maxWidth: "90px" }} /></td>
                                                                    <td>{prod.price}</td>
                                                                    <td>{prod.quantity}</td>

                                                                    <td>{prod?.discountTotal ? prod.discountTotal : 0}</td>
                                                                    <td>{prod?.subTotal ? prod.subTotal : 0}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="12">No items in the cart</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </Table>
                                    </div>
                                    <p><strong>Non System Products</strong></p>
                                    <div className="table-responsive">
                                        <Table className="table-bigboy">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Designs</th>
                                                    <th>Body Part</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Discount</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {

                                                    customer.cart[0] && customer.cart[0].nonSystemProducts && customer.cart[0].nonSystemProducts.length > 0 ? (
                                                        customer.cart[0].nonSystemProducts.map((prod, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{prod.productName}</td>
                                                                    <td>
                                                                        <Table className="table-bigboy">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Image</th>
                                                                                    <th>Price</th>
                                                                                    <th>Qty</th>
                                                                                </tr>
                                                                                {
                                                                                    prod.designs.map((d, i) => {
                                                                                        return (
                                                                                            <tr key={i}>
                                                                                                <td><img src={d.image} style={{ maxWidth: "90px" }} /></td>
                                                                                                <td>{d.price}</td>
                                                                                                <td>{d.quantity}</td>
                                                                                            </tr>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </thead>
                                                                        </Table>
                                                                    </td>
                                                                    <td>
                                                                        {{
                                                                            1: "Left Arm",
                                                                            2: "Right Arm",
                                                                            3: "Chest",
                                                                            4: "Neck",
                                                                            5: "Back",
                                                                            6: "Left Leg",
                                                                            7: "Right Leg",
                                                                            8: "Wrist",
                                                                        }[prod.bodyPart]}
                                                                    </td>
                                                                    <td>{prod?.price ? prod.price : 0}</td>
                                                                    <td>{prod?.quantity ? prod.quantity : 0}</td>
                                                                    <td>{prod?.discountTotal ? prod.discountTotal : 0}</td>
                                                                    <td>{prod?.subTotal ? prod.subTotal : 0}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="12">No items in the cart</td>
                                                        </tr>
                                                    )
                                                }

                                            </tbody>
                                        </Table>

                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-info" onClick={() => setCartModal(false)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                        {/*  */}
                        {/*Customer View Model*/}
                        {/*  */}
                        {
                            modalType === 2 && customer &&
                            <Modal className="modal-primary" onHide={() => setUserModal(!userModal)} show={userModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                View
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <Form.Group>
                                            <label className="label-font mr-2">Profile Image: </label>
                                            <div>
                                                <div className="user-view-image">
                                                    <img src={customer.profileImage ? customer.profileImage : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} />
                                                </div>
                                            </div>
                                        </Form.Group>

                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Customer Name: </label><span className="field-value">{customer.customername ? customer.customername : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Email: </label><span className="field-value">{customer.email ? customer.email : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Mobile: </label><span className="field-value">{customer.mobile ? customer.mobile : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Address: </label><span className="field-value">{customer.address ? customer.address : "N/A"}</span>
                                            </Form.Group>
                                        </div>

                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Status: </label><span className="field-value">{customer.status ? 'Active' : "In Active"}</span>
                                            </Form.Group>
                                        </div>

                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Notifications Allowed: </label><span className="field-value">{customer.sendNotification ? 'Allowed' : "Not Allowed"}</span>
                                            </Form.Group>
                                        </div>

                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-info" onClick={() => setUserModal(!userModal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                        {/*  */}
                        {/*Customer Add/Edit Model*/}
                        {/*  */}
                        {
                            (modalType === 1 || modalType === 3) && customer &&
                            <Modal className="modal-primary" onHide={() => setUserModal(!userModal)} show={userModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {modalType === 1 ? 'Add ' : modalType === 3 ? 'Edit ' : ''}
                                                Customer Information
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <Form.Group className="text-center">
                                            <label>Profile Image</label>
                                            <div className='mb-2'>
                                                {<img className="img-thumbnail" src={profileImage ? profileImage : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '100px' }} />}
                                            </div>
                                            <div className='mb-2 mt-3'>
                                                <Form.Control
                                                    className='text-white custom'
                                                    onChange={async (e) => {
                                                        // fileSelectHandler(e);
                                                        const res = await ENV.uploadImage(e);
                                                        setProfileImage(res ? ENV.uploadedImgPath + res : "")
                                                    }}
                                                    accept="image/*"
                                                    type="file"
                                                ></Form.Control>
                                            </div>
                                            <label><small>Recommended Image Size: 400 x 400px</small></label>
                                            <span className={profileImageMsg ? `` : `d-none`}>
                                                {(profileImage === '' || profileImage === null) && <label className="pl-1 text-danger">{profileImageMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Customer Name <span className="text-danger">*</span></label>
                                            <Form.Control
                                                placeholder="Enter Name"
                                                type="text"
                                                name="customername"
                                                minLength={3}
                                                maxLength={35}
                                                onChange={(e) => {
                                                    setUsername(e.target.value)
                                                    setUsernameMsg("")
                                                }}
                                                value={customername}
                                                required

                                            />
                                            <span className={usernameMsg ? `` : `d-none`}>
                                                <label className="pl-1 text-danger">{usernameMsg}</label>
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Email <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly={modalType == 3}
                                                placeholder="Enter Email"
                                                type="email"
                                                name="email"
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    setEmailMsg("")
                                                }}
                                                value={email}
                                                required
                                            />
                                            <span className={emailMsg ? `` : `d-none`}>
                                                <label className="pl-1 text-danger">{emailMsg}</label>
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Mobile Number <span className="text-danger">*</span></label>
                                            <Form.Control
                                                placeholder="+1234567890"
                                                type="tel"
                                                name="mobile"
                                                onChange={(e) => {
                                                    setMobile(e.target.value)
                                                    setMobileMsg("")
                                                }}
                                                value={mobile}
                                                required
                                            />
                                            <span className={mobileMsg ? `` : `d-none`}>
                                                <label className="pl-1 text-danger">{mobileMsg}</label>
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Address <span className="text-danger">*</span></label>
                                            <Form.Control
                                                placeholder="House # Block Street State City Country"
                                                type="text"
                                                name="address"
                                                onChange={(e) => {
                                                    setAddress(e.target.value)
                                                    setAddressMsg("")
                                                }}
                                                value={address}

                                                maxLength={200}
                                                required

                                            />
                                            <span className={addressMsg ? `` : `d-none`}>
                                                <label className="pl-1 text-danger">{addressMsg}</label>
                                            </span>
                                        </Form.Group>


                                        {
                                            modalType === 3 ?

                                                <Form.Group>
                                                    <Form.Group>
                                                        <label>Password</label>
                                                        <div className="form-password-eye-box">
                                                            <Form.Control
                                                                placeholder="Password"
                                                                type={showPassword ? "text" : "password"}
                                                                name="description"
                                                                onChange={(e) => {
                                                                    setPassword(e.target.value)
                                                                    setPasswordMsg("")
                                                                }}
                                                                value={password}
                                                                required
                                                            />
                                                            <button onClick={(e) => showPasswordMethod(e)} className="form-password-eye">
                                                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                                            </button>
                                                        </div>
                                                        <span className={passwordMsg ? `` : `d-none`}>
                                                            <label className="pl-1 text-danger">{passwordMsg}</label>
                                                        </span>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <label>Confirm Password</label>
                                                        <div className="form-password-eye-box">
                                                            <Form.Control
                                                                placeholder="Confirm Password"
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                name="description"
                                                                onChange={(e) => {
                                                                    setConfirmPassword(e.target.value)
                                                                    setConfirmPasswordMsg("")
                                                                }}
                                                                value={confirmPassword}
                                                                required
                                                            />
                                                            <button onClick={(e) => showConfirmPasswordMethod(e)} className="form-password-eye">
                                                                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                                                            </button>
                                                        </div>
                                                        <span className={confirmPasswordMsg ? `` : `d-none`}>

                                                            <label className="pl-1 text-danger">{confirmPasswordMsg}</label>
                                                        </span>
                                                    </Form.Group>
                                                </Form.Group>
                                                :
                                                null
                                        }

                                        <Form.Group>
                                            <label className='mr-2'>Status<span className="text-danger"> *</span></label>
                                            <label className="right-label-radio mb-2 mr-2">
                                                <div className='d-flex align-items-center'>
                                                    <input name="status" type="radio" checked={status} value={status} onChange={(e) => { setStatus(true) }} />
                                                    <span className="checkmark"></span>
                                                    <span className='ml-1' onChange={(e) => {
                                                        setStatus(true);
                                                    }} ><i />Active</span>
                                                </div>
                                            </label>
                                            <label className="right-label-radio mr-3 mb-2">
                                                <div className='d-flex align-items-center'>
                                                    <input name="status" type="radio" checked={!status} value={!status} onChange={(e) => { setStatus(false) }} />
                                                    <span className="checkmark"></span>
                                                    <span className='ml-1' onChange={(e) => {
                                                        setStatus(false);
                                                    }} ><i />Inactive</span>
                                                </div>
                                            </label>

                                        </Form.Group>
                                        <Form.Group>
                                            <label className='mr-2'>Notification Allowed<span className="text-danger"> *</span></label>
                                            <label className="right-label-radio mb-2 mr-2">
                                                <div className='d-flex align-items-center'>
                                                    <input name="sendNotification" type="radio" checked={sendNotification} value={sendNotification} onChange={(e) => { setSendNotification(true) }} />
                                                    <span className="checkmark"></span>
                                                    <span className='ml-1' onChange={(e) => {
                                                        setSendNotification(true);
                                                    }} ><i />Allowed</span>
                                                </div>
                                            </label>
                                            <label className="right-label-radio mr-3 mb-2">
                                                <div className='d-flex align-items-center'>
                                                    <input name="sendNotification" type="radio" checked={!sendNotification} value={!sendNotification} onChange={(e) => { setSendNotification(false) }} />
                                                    <span className="checkmark"></span>
                                                    <span className='ml-1' onChange={(e) => {
                                                        setSendNotification(false);
                                                    }} ><i />Not Allowed</span>
                                                </div>
                                            </label>

                                        </Form.Group>


                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-warning"
                                        onClick={() => setUserModal(!userModal)}
                                    >Close</Button>
                                    {
                                        modalType === 3 ? '' :
                                            <Button className="btn btn-info" onClick={() => submit(customer._id)} /* disabled={isLoader} */>Save</Button>
                                    }
                                    {
                                        modalType === 1 ? '' :
                                            <Button className="btn btn-info" onClick={() => submit(customer._id)} /* disabled={isLoader} */>Update</Button>
                                    }

                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    customer: state.customer,
    error: state.error,
    getRoleRes: state.role.getRoleRes,

});

export default connect(mapStateToProps, { beforeCustomer, getCustomers, deleteCustomer, createCustomer, editCustomer, sendVerificationEmail })(Customers);