import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../../config/config';
import { beforeRole, updateRole, deleteRole, getRole, getPermission, getRoles } from './permissions.actions'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify'
import validator from 'validator';
import Pagination from 'rc-pagination';
import { Link } from 'react-router-dom'
import 'rc-pagination/assets/index.css';
import PermissionsModal from './permissionsModalComponent'
import PaginationLimitSelector from '../../Components/PaginationLimitSelector';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Overlay, Tooltip, Modal, FormGroup } from "react-bootstrap";
var CryptoJS = require("crypto-js");
import { Helmet } from 'react-helmet';



const StaffPermissions = (props) => {
    const [roleModal, setroleModal] = useState(false)

    const [modalType, setModalType] = useState(0)
    const [isLoader, setLoader] = useState(true)
    const [currentUserRole, setCurrentUserRole] = useState({})
    const [currentRoleId, setCurrentRoleId] = useState('')
    const [roles, setRoles] = useState()
    const [search, setSearch] = useState('')
    const [searchStatus, setSearchStatus] = useState(null)
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [role, setRole] = useState({
        /**  system permissions **/
        "addAdmin": false,
        "editAdmin": false,
        "deleteAdmin": false,
        "viewAdmin": false,
        "addCMS": false,
        "editCMS": false,
        "deleteCMS": false,
        "viewCMS": false,
        "editEmails": false,
        "viewEmails": false,
        "editSetting": false,
        "viewSetting": false,
        "addEmailTemplate": false,
        "editEmailTemplate": false,
        "deleteEmailTemplate": false,
        "viewEmailTemplate": false,
        "addEmailType": false,
        "editEmailType": false,
        "deleteEmailType": false,
        "viewEmailType": false,
        "addCustomer": false,
        "editCustomer": false,
        "deleteCustomer": false,
        "viewCustomer": false,
        "addFaq": false,
        "editFaq": false,
        "deleteFaq": false,
        "viewFaqs": false,
        "addFaqCategory": false,
        "editFaqCategory": false,
        "deleteFaqCategory": false,
        "viewFaqCategories": false,
        "addCategory": false,
        "editCategory": false,
        "deleteCategory": false,
        "viewCategories": false,
        "addPromotion": false,
        "editPromotion": false,
        "deletePromotion": false,
        "viewPromotions": false,
        "addSizeGroup": false,
        "editSizeGroup": false,
        "deleteSizeGroup": false,
        "viewSizeGroups": false,
        "addOrder": false,
        "editOrder": false,
        //"confirmOrder": false,
        "viewOrders": false,
        "cancelOrder": false,
        // "createInvoice": false,
        "registerPayment": false,
        "addContent": false,
        "editContent": false,
        "deleteContent": false,
        "viewContents": false,
        "addProduct": false,
        "editProduct": false,
        "deleteProduct": false,
        "viewProducts": false,
        "viewSalesReport": false,
        "viewInvoiceReport": false,
        "viewBugReport": false,
        "replyBugReport": false,
        "addContactQuery": false,
        "editContactQuery": false,
        "deleteContactQuery": false,
        "viewContactQueries": false,
        "addRole": false,
        "editRole": false,
        "deleteRole": false,
        "viewRole": false,

        "status": true

    })
    // set modal type
    const setModal = (type = 1, role = {}) => {
        setroleModal(!roleModal)
        setModalType(type)
        setLoader(false)
        // add category
        if ((type === 2 || type === 3) && role) {
            setRole(role)
        }
    }
    const deleteRoleHandler = (roleId) => {
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
                props.deleteRole(roleId)
            }
        })
    }
    const getData = (role) => {
        props.getRoles()
        setRole(role)
    }
    const onSearch = () => {
        const filter = {}
        if (search) {
            filter.name = search
        }
        if (searchStatus) {
            filter.status = searchStatus
        }
        props.getRoles(1, limit, filter)
        setModalType(0)
        setLoader(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
        }
    }
    const reset = () => {
        setLoader(true)
        setSearch('')
        setSearchStatus('')
        setLimit(10);
        props.getRoles()
    }
    const onPageChange = (page) => {
        const filter = {}
        if (search) {
            filter.name = search
        }

        if (searchStatus) {
            filter.status = searchStatus
        }

        props.getRoles(page, limit, filter)
        setLoader(true)
    }
    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (search) {
            filter.name = search
        }
        if (searchStatus) {
            filter.status = searchStatus
        }

        props.getRoles(1, newLimit, filter)
        setLoader(true)
    }
    useEffect(() => {
        props.getRoles()
        let roleEncrypted = localStorage.getItem('role');
        let role = '';
        if (roleEncrypted) {
            let roleDecrepted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            props.getPermission(roleDecrepted)
            if (roleDecrepted && roleDecrepted.trim() !== "") {
                role = roleDecrepted
            }
            else {
                ENV.clearStorage();
            }
        }
        setCurrentRoleId(role !== '' ? role : null)
    }, [])
    useEffect(() => {

        if (Object.keys(props.getRolesRes).length > 0) {
            setLoader(false)
            setRoles(props.getRolesRes.data)
            setPage(props.getRolesRes.page)
            setPages(props.getRolesRes.pages)
            setTotal(props.getRolesRes.total)
            setLimit(props.getRolesRes.limit)
            // props.beforeRole();
        }
    }, [props.getRolesRes])

    useEffect(() => {
        if (props.currentUserPermission.authPermission) {
            setCurrentUserRole(props.currentUserPermission.permission.role)
        }
    }, [props.currentUserPermission.authPermission])

    useEffect(() => {
        if (props.existsRole) {
            setRole(props.existRoleRes.role)
            setLoader(false)
            props.beforeRole()
        }
    }, [props.existsRole])

    useEffect(() => {
        if (Object.keys(props.deleteRoleRes).length > 0 && props.authenticate === true) {
            setModalType(1)
            setLoader(false)
            toast.success(props.deleteRoleRes.message);
            props.beforeRole();
            props.getRoles();
        }
    }, [props.deleteRoleRes])


    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Roles </title>
            </Helmet>
            {
                isLoader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="filter-card card">
                                    <Card.Header>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Label style={{ color: 'black' }} className="d-block mb-2">Title</Form.Label>
                                                <Form.Group>
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" placeholder="Title" name="search" value={search} onChange={(e) => setSearch(e.target.value)}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Label style={{ color: 'black' }} className="d-block mb-2">Status</Form.Label>
                                                <Form.Group>
                                                    <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
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
                                                        <button type="button" className="btn btn-info" disabled={!search && !searchStatus} onClick={onSearch} >Search</button>
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
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${total}`}</span>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Permissions</Card.Title>
                                            {
                                                currentUserRole?.addRole ?
                                                    <Button variant="info" className="float-sm-right mb-0" onClick={() => setModal(1)}> Add New Staff Role</Button> : ""
                                            }
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className="text-center">Title</th>
                                                        <th className="text-center">Status</th>
                                                        <th className="text-center td-action">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        roles && roles.length > 0 ?
                                                            roles.map((val, key) => {
                                                                return (
                                                                    <tr key={key}>
                                                                        <td className='text-center'>{((limit * page) - limit) + key + 1}</td>
                                                                        <td className="text-center"><Link to='#' data-toggle="modal" data-target="modal-primary" className="text-capitalize" onClick={() => setModal(2, val)}>{val.title}</Link></td>
                                                                        <td className="text-center">
                                                                            <span className={`status ${val.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                {
                                                                                    val.status ?
                                                                                        <span className="label label-success p-1">Active</span>
                                                                                        : <span className="label label-danger status p-1">Inactive</span>
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                <li className="d-inline-block align-top">


                                                                                    {
                                                                                        currentUserRole?.viewRole ?
                                                                                            <button type='button'
                                                                                                data-toggle="tooltip" data-placement="top"
                                                                                                title="View"
                                                                                                className="btn-action btn-primary" onClick={() => setModal(2, val)}><i className="fa fa-eye" /></button>
                                                                                            : <></>
                                                                                    }
                                                                                </li>
                                                                                <li className="d-inline-block align-top">

                                                                                    {currentUserRole?.editRole ?

                                                                                        (currentRoleId !== val._id ?
                                                                                            <button className="btn-action btn-warning" title="Edit" onClick={() => setModal(3, val)}><i className="fa fa-edit" /></button>
                                                                                            :
                                                                                            <button className="btn-action btn-danger" title="Edit" disabled><i className="fa fa-edit" /></button>) : <></>
                                                                                    }
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    {currentUserRole?.deleteRole ?
                                                                                        (currentUserRole?.deleteRole && currentRoleId !== val._id ?
                                                                                            <button className="btn-action btn-danger" title="Delete" onClick={() => deleteRoleHandler(val._id)}><i className="fa fa-trash" /></button>
                                                                                            :
                                                                                            <></>

                                                                                        ) : <></>
                                                                                    }
                                                                                </li>
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td className="text-center px-0" colSpan="5">
                                                                    <span className="alert alert-info d-block text-center">No Record Found</span>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <Col className="pb-4">
                                                <div className='d-flex align-items-center justify-content-between pagination-wrapper'>

                                                    <Pagination
                                                        defaultCurrent={1}
                                                        pageSize // items per page
                                                        current={page} // current active page
                                                        total={pages} // total pages
                                                        onChange={onPageChange}
                                                        locale={localeInfo}
                                                    />
                                                    <PaginationLimitSelector limit={limit} itemsPerPageChange={itemsPerPageChange} currentPage={page} total={total} />
                                                </div>
                                            </Col>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <PermissionsModal existRole={props.existsRole} setData={getData} modalType={modalType} setModalType={setModalType} roleModal={roleModal} setroleModal={setroleModal} role={role} roles={roles} setLoader={setLoader} setRole={setRole} />
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    existRoleRes: state.role.existRoleRes,
    addRoleRes: state.role.addRoleRes,
    updateRoleRes: state.role.updateRoleRes,
    deleteRoleRes: state.role.deleteRoleRes,
    getRoleRes: state.role.getRoleRes,
    getRolesRes: state.role.getRolesRes,
    authenticate: state.role.authenticate,
    role: state.role,
    existsRole: state.role.existsRole,
    errors: state.errors,
    currentUserPermission: state.role,
});

export default connect(mapStateToProps, { beforeRole, updateRole, deleteRole, getRole, getRoles, getPermission })(StaffPermissions);