import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeDesignImprint, getDesignImprints, addDesignImprint, editDesignImprint, deleteDesignImprint } from './DesignImprint.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, Modal } from "react-bootstrap";
import { currencyFormat } from '../../../src/utils/functions'
var CryptoJS = require("crypto-js");
import { Helmet } from 'react-helmet';

const DesignImprints = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [searchStatus, setSearchStatus] = useState(null)
    const [search, setSearch] = useState('')
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [designImprint, setDesignImprint] = useState(null)
    const [msg, setMsg] = useState({
        title: '',
        price: '',
    })
    const [modal, setModal] = useState(false)
    const [modalType, setModalType] = useState(false)       // 0: Add 1: View 2: Edit

    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        props.getDesignImprints(qs, filter)
        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)
    }, [])

    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])                          // Roles Fetched

    useEffect(() => {
        if (props.designImprints.getDesignImprintsAuth) {
            let { designImprints, pagination } = props.designImprints.designImprints
            setData(designImprints)
            setLoader(false)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setModal(false)
            props.beforeDesignImprint()
        }
    }, [props.designImprints.getDesignImprintsAuth])        // Design Imprints Fetched                

    useEffect(() => {
        if (props.designImprints.createAuth || props.designImprints.editDesignImprintAuth || props.designImprints.delDesignImprintAuth) {
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            const filter = {}
            props.getDesignImprints(qs, filter)
        }
    }, [props.designImprints.createAuth, props.designImprints.editDesignImprintAuth, props.designImprints.delDesignImprintAuth])         // Design Imprint Created, Deleted


    useEffect(() => {
        if (props.designImprints.existDesignImprintAuth) {
            setLoader(false)
            setMsg({
                title: 'Title already exist'
            })
            props.beforeDesignImprint()
        }
    }, [props.designImprints.existDesignImprintAuth, ])         // Design Imprint Exist



    const deleteDesignImprint = (designImprintId) => {
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
                props.deleteDesignImprint(designImprintId)
            }
        })
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }

    const onPageChange = async (page) => {
        const filter = {}
        setPage(page)
        setLoader(true)
        if (search)
            filter.title = search
        if (searchStatus)
            filter.status = searchStatus
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getDesignImprints(qs, filter)
    }


    const itemsPerPageChange = (newLimit) => {
        const filter = {}
        setLimit(newLimit);
        if (search)
            filter.title = search
        if (searchStatus)
            filter.status = searchStatus
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getDesignImprints(qs, filter)
        setLoader(true)

    }


    // Function to apply filters and fetch bug reports based on filter criteria
    const applyFilters = () => {
        const filter = {}
        if (search)
            filter.title = search
        if (searchStatus)
            filter.status = searchStatus
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getDesignImprints(qs, filter)
        setLoader(true)
    }


    // Function to reset filters
    const reset = () => {

        setSearch('')
        setSearchStatus('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getDesignImprints(qs)
        setLoader(true)
    }

    const initialModalData = (item = null) => {

        if (item == null) {
            setDesignImprint({
                title: '',
                price: '',
                status: true,
            })
        } else {
            setDesignImprint({
                _id: item._id,
                title: item.title,
                price: item.price,
                status: item.status
            })

        }
        setMsg({
            title: '',
            price: ''
        })

    }

    const setFormModal = (type, item = null) => {
        initialModalData(item)
        setModal(!modal)
        setModalType(type)
    }


    const submitForm = () => {
        const errors = {};

        // Validation for required fields
        if (!designImprint.title.trim()) {
            errors.title = 'Title is required.';
        }
        if (!designImprint.price) {
            errors.price = 'Price is required.';
        }

        if (designImprint.price) {
            if (designImprint.price <= 0) {
                errors.price = `Price must be greater than zero.`;
            } else if (!/^\d+(\.\d{1,2})?$/.test(designImprint.price)) {
                errors.price = `Price must have up to 2 decimal.`;
            }
        }

        setMsg(errors);

        // Check if there are no errors
        const isValid = Object.keys(errors).length === 0;
        if (isValid) {
            setLoader(true)
            if (modalType === 0) {
                props.addDesignImprint({ ...designImprint });
            } else if (modalType === 2) {
                props.editDesignImprint({ ...designImprint });
            }
        }
    };

    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | Design Imprints </title>
        </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row className="pb-3">
                            <Col md="12">
                                <Card className="filter-card card custom">
                                    <Card.Header>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>


                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Title</Form.Label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder="Title" name="Title" value={search} onChange={(e) => setSearch(e.target.value)}></Form.Control>
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Label style={{ color: 'black' }} className="d-block mb-2">Status</Form.Label>
                                                <Form.Group>
                                                    <select onKeyPress={handleKeyPress} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                                                        <option value="">Select Status</option>
                                                        <option value='true'>Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </Form.Group>
                                            </Col>


                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label className="d-none d-sm-block mb-2 form-label">&nbsp;</label>
                                                    <div className="d-flex justify-content-between filter-btns-holder">
                                                        <button type="button" className="btn btn-info" disabled={!search && !searchStatus} onClick={applyFilters} >Search</button>
                                                        <button type="button" className="btn btn-warning" hidden={!search && !searchStatus} onClick={reset}>Reset</button>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Design Imprints</Card.Title>
                                            {
                                                permissions && permissions.addDesignImprints &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setFormModal(0)}>
                                                    Add Design Imprint
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
                                                        <th className='text-center'>Title</th>
                                                        <th className='text-center'>Price($)</th>
                                                        <th className='text-center'>Status</th>
                                                        <th className="text-center td-actions">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        data && data.length ?
                                                            data.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                        <td className="text-center">
                                                                            {item.title}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item.price ? currencyFormat(item.price) : ""}
                                                                        </td>
                                                                        <td className="text-center">

                                                                            <span className={` status ${item.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {item.status ? 'Active' : 'Inactive'}</span>
                                                                            </span>

                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                <li className="d-inline-block align-top">
                                                                                    <Button
                                                                                        className="btn-action btn-primary"
                                                                                        type="button" title="View"
                                                                                        onClick={() => setFormModal(1, item)}
                                                                                    >
                                                                                        <i className="fa fa-eye"></i>
                                                                                    </Button>
                                                                                </li>

                                                                                {
                                                                                    permissions && permissions.editDesignImprints &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="success"
                                                                                            onClick={() => setFormModal(2, item)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deleteDesignImprints &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button"
                                                                                            variant="danger" title="Delete"
                                                                                            onClick={() => deleteDesignImprint(item._id)}
                                                                                        >
                                                                                            <i className="fas fa-trash"></i>
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
                                                                <td colSpan="5" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Design Imprint Found</div>
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
                        {
                            modal &&
                            <Modal className="modal-primary" id="content-Modal" onHide={() => setModal(!modal)} show={modal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {modalType == 0 ? "Add" : modalType == 2 ? "Edit" : "View"} Design Imprint
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Title <span className="text-danger">*</span></label>
                                                    {modalType == 1 ?
                                                        <Form.Control
                                                            readOnly
                                                            placeholder="Enter title"
                                                            type="text"
                                                            value={designImprint.title}

                                                        />
                                                        :
                                                        <>
                                                            <Form.Control
                                                                placeholder="Enter title"
                                                                type="text"
                                                                value={designImprint.title}
                                                                onChange={(event) => setDesignImprint({ ...designImprint, title: event.target.value })}
                                                                onInput={() => setMsg((prevMsg) => ({ ...prevMsg, title: '' }))}
                                                                min={0}
                                                            />
                                                            <span className={msg.title ? `` : `d-none`}>
                                                                <small className="pl-1 text-danger">{msg.title}</small>
                                                            </span>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label> Price ($) <span className="text-danger">*</span></label>
                                                    {modalType == 1 ?
                                                        <Form.Control
                                                            readOnly
                                                            type="number"
                                                            value={designImprint.price}
                                                        />
                                                        :
                                                        <>
                                                            <Form.Control
                                                                placeholder="Enter price"
                                                                type="number"
                                                                value={designImprint.price}
                                                                onChange={(event) => setDesignImprint({ ...designImprint, price: event.target.value })}
                                                                onInput={() => setMsg((prevMsg) => ({ ...prevMsg, price: '' }))}
                                                                onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                                min={0}
                                                            />
                                                            <span className={msg.price ? `` : `d-none`}>
                                                                <small className="pl-1 text-danger">{msg.price}</small>
                                                            </span>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group >
                                                    <label className='d-block'>Status <span className="text-danger">*</span></label>
                                                    <label className={`right-label-radio mr-3 mb-2 ${modalType === 1 ? 'disabled-checkbox' : ''}`}>
                                                        <div >
                                                            <input disabled={modalType === 1} name="status" type="checkbox" checked={designImprint.status} value={designImprint.status} onChange={(e) => setDesignImprint({ ...designImprint, status: true })} />
                                                            <span className="checkmark"></span>
                                                        </div>

                                                        <span className='ml-2 d-inline-block' oonChange={(e) => setDesignImprint({ ...designImprint, status: true })} ><i />Active

                                                        </span>
                                                    </label>
                                                    <label className={`right-label-radio mr-3 mb-2 ${modalType === 1 ? 'disabled-checkbox' : ''}`}>
                                                        <span className="checkmark"></span>
                                                        <div> <input disabled={modalType === 1} name="status" type="checkbox" checked={!designImprint.status} value={!designImprint.status} onChange={(e) => setDesignImprint({ ...designImprint, status: false })} />
                                                            <span className="checkmark"></span>
                                                        </div>
                                                        <span className='ml-2' onChange={(e) => setDesignImprint({ ...designImprint, status: false })} ><i />Inactive</span>
                                                    </label>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    {modalType != 1 && <Button className="btn btn-success" onClick={() => submitForm()}>{modalType == 0 ? "Add" : "Update"}</Button>}
                                    <Button className="btn btn-danger" onClick={() => setModal(!modal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    designImprints: state.designImprints,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeDesignImprint, getDesignImprints, addDesignImprint, editDesignImprint, deleteDesignImprint, getRole })(DesignImprints);