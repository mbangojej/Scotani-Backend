import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { getAdmin, getStaffAdmins, deleteAdmin, beforeAdmin } from 'views/Admin/Admin.action';
import { getRoles } from '../permissions/permissions.actions';
import { getPermission } from '../permissions/permissions.actions';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Swal from 'sweetalert2';
import Pagination from 'rc-pagination';
import { Link } from 'react-router-dom'
import 'rc-pagination/assets/index.css';
import StaffModal from './staffModalComponent'
import localeInfo from 'rc-pagination/lib/locale/en_US';
import queryString from 'query-string';
import userDefaultImg from '../../../assets/img/default-user-icon-13.jpg';
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap";
import PaginationLimitSelector from '../../Components/PaginationLimitSelector';
var CryptoJS = require("crypto-js");
var adminId = localStorage.getItem('userID')
import { Helmet } from 'react-helmet';

const AdminStaff = (props) => {
    const { _adminId } = queryString.parse(location.search);
    const [admins, setAdmins] = useState({})
    const [admin, setAdmin] = useState({})
    const [currentUserRole, setCurrentUserRole] = useState({})
    const [isLoader, setLoader] = useState(true)
    const [roleModal, setroleModal] = useState(false)
    const [adminType, setAdminType] = useState(true)
    const [modalType, setModalType] = useState()
    const [roles, setRoles] = useState()
    const [search, setSearch] = useState('')
    const [searchRole, setSearchRole] = useState('')
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [searchStatus, setSearchStatus] = useState(null)
    const [searchEmail, setSearchEmail] = useState(null)

    // set modal type
    const setModal = (type = 1, admin = {}) => {
        setroleModal(!roleModal)
        setModalType(type)
        setLoader(false)
        // add category
        if ((type === 2 || type === 3) && admin) {
            setAdmin(admin)
        }
    }
    const deleteRoleHandler = (adminId) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: 'If you delete a staff record, it would be permanently lost.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.value) {
                setLoader(true)
                props.deleteAdmin(adminId)
            }
        })
    }
    const onSearch = () => {
        const filter = {}
        if (search) {
            filter.name = search
        }
        if (searchEmail) {
            filter.email = searchEmail
        }

        if (searchStatus) {
            filter.status = searchStatus
        }
        if (searchRole) {
            filter.roleId = searchRole
        }

        props.getStaffAdmins(1, limit, filter, adminId)
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
        setSearchRole('')
        setSearchStatus('')
        setSearchEmail('')
        setPage(1)
        setLimit(10);
        props.getStaffAdmins(1, 10, "", adminId)
    }
    const onPageChange = (page) => {
        props.getStaffAdmins(page, limit, search, adminId)
        setLoader(true)
    }
    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        props.getStaffAdmins(1, newLimit, search, adminId)
        setLoader(true)
    };
    const getData = (admin) => {
        props.getStaffAdmins(page, limit, search, adminId)
        setAdmin(admin)
    }
    const loadStaff = () => {
        props.getStaffAdmins(1, 10, "", localStorage.getItem('userID'))
    }
    useEffect(() => {
        let roleEncrypted = localStorage.getItem('role');
        let role = '';
        if (roleEncrypted) {
            let roleDecrepted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            props.getPermission(roleDecrepted)
            loadStaff()
            props.getRoles(1, 10, '', 1)
            setLoader(true)
        }
    }, [])
    useEffect(() => {
        if (props.currentUserPermission.authPermission) {
            setCurrentUserRole(props.currentUserPermission.permission.role)
        }
    }, [props.currentUserPermission.authPermission])
    useEffect(() => {
        if (props.getAdminsAuth && Object.keys(props?.getAdminsRes?.data).length > 0) {
            setLoader(false)
            let data = props.getAdminsRes.data
            setAdmins(data.admins)
            setPage(data.pagination.page)
            setPages(data.pagination.pages)
            setLimit(data.pagination.limit)
            setTotal(data.pagination.total)
            if (_adminId && adminType) {
                setAdminType(false)
                const admin = data.admins.find((elem) => String(elem._id) === String(_adminId))
                setModal(3, admin)
            }
            props.beforeAdmin()
        }
    }, [props.getAdminsAuth])
    useEffect(() => {
        if (props.addAdminAuth) {
            setLoader(false)
            props.getStaffAdmins(1, 10, "", localStorage.getItem('userID'))
            props.beforeAdmin()
        }
    }, [props.addAdminAuth])
    useEffect(() => {
        if (Object.keys(props.deleteAdminRes).length > 0) {
            setModalType(1)
            setLoader(false)
            props.beforeAdmin();
            props.getStaffAdmins(1, 10, "", adminId);
        }
    }, [props.deleteAdminRes])
    useEffect(() => {
        if (Object.keys(props.getRolesRes).length > 0) {
            setRoles(props.getRolesRes.data)
        }
    }, [props.getRolesRes])
    useEffect(() => {
        if (props.getExistAdmin) {
            // setAdmin(props.existAdminRes.admin)
            setLoader(false)
            props.beforeAdmin()
        }
    }, [props.getExistAdmin])
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Staff </title>
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
                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Name</Form.Label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder="Name" name="Name" value={search} onChange={(e) => setSearch(e.target.value)}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Email</Form.Label>
                                                    <Form.Control onKeyPress={handleKeyPress} value={searchEmail} type="text" placeholder="john@gmail.com" onChange={(e) => setSearchEmail(e.target.value)} /*onKeyDown={} */ />
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
                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Label style={{ color: 'black' }} className="d-block mb-2">Role</Form.Label>
                                                <Form.Group>
                                                    <select value={searchRole} onChange={(e) => setSearchRole(e.target.value)}>
                                                        <option value="">Select Role</option>
                                                        {
                                                            roles && roles.length > 0 ?
                                                                roles.map((role, key) => {
                                                                    if (role.title != 'super admin')
                                                                        return (<option key={key} value={role._id}>{role.title}</option>);
                                                                }) : <option value='' disabled>No role found</option>
                                                        }
                                                    </select>
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label className="d-none d-sm-block mb-2 form-label">&nbsp;</label>
                                                    <div className="d-flex justify-content-between filter-btns-holder">
                                                        <button type="button" className="btn btn-info" disabled={!search && !searchRole && !searchStatus && !searchEmail} onClick={onSearch} >Search</button>
                                                        <button type="button" className="btn btn-warning" hidden={!search && !searchRole && !searchStatus && !searchEmail} onClick={reset}>Reset</button>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ fontWeight: 'bold' }}>{`Total : ${total}`}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Staff</Card.Title>
                                            {currentUserRole && currentUserRole.addAdmin ?
                                                <Button variant="info" className="float-sm-right mb-0" onClick={() => setModal(1)}> Add New Staff</Button>
                                                :
                                                ''
                                            }
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy cards-table-wrapper">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className="text-center" >Image</th>
                                                        <th className="text-center" >Name</th>
                                                        <th className="text-center" >Email</th>
                                                        <th className="text-center" >Role</th>
                                                        <th className="text-center" >Status</th>
                                                        <th className="text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        admins && admins.length > 0 ?
                                                            admins.map((val, key) => {
                                                                return (
                                                                    <tr key={key}>
                                                                        <td className='text-center serial-col'>{((limit * page) - limit) + key + 1}</td>

                                                                        <td className="text-center">
                                                                            <div className="user-image">
                                                                                <img className="img-fluid" alt="User Image" src={val.image ? val.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} />
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center"><Link to='#' data-toggle="modal" data-target="#admin-modal" className="text-capitalize" onClick={() => setModal(2, val)}>{val.name}</Link></td>
                                                                        <td className="text-center">{val.email}</td>
                                                                        <td className="text-center">{val.role.title}</td>
                                                                        <td className="text-center">
                                                                            <span className={`text-white status ${val.status ? `bg-success` : `bg-danger`}`}>
                                                                                {val.status ? val.status === true ? 'Active' : false : 'Inactive'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0 d-flex">
                                                                                <li className="d-inline-block align-top">

                                                                                    {currentUserRole?.editAdmin && val.role.title != 'super admin' ?
                                                                                        <button className="btn-action btn-warning" title="Edit" onClick={() => setModal(3, val)}><i className="fa fa-edit" /></button>
                                                                                        : <></>
                                                                                    }
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    {
                                                                                        currentUserRole?.viewAdmin ?
                                                                                            <button type='button'
                                                                                                data-toggle="tooltip" data-placement="top"
                                                                                                title="View"
                                                                                                className="btn-action btn-primary" onClick={() => setModal(2, val)}><i className="fa fa-eye" />
                                                                                            </button>
                                                                                            : <></>
                                                                                    }
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                    {currentUserRole?.deleteAdmin && val.role.title != 'super admin' ?
                                                                                        <button className="btn-action btn-danger" title="Delete" onClick={() => deleteRoleHandler(val._id)}><i className="fa fa-trash" /></button>
                                                                                        : <></>
                                                                                    }
                                                                                </li>
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td className="text-center px-0" colSpan="7">
                                                                    <span className="alert alert-info d-block text-center">No Record Found</span>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <Col className="pb-4">
                                                <div className='d-flex align-items-center justify-content-between pagination-wrapper'>
                                                    <Pagination
                                                        defaultCurrent={2}
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
                        <StaffModal loadStaff={loadStaff} getExistAdmin={props.getExistAdmin} getData={getData} modalType={modalType} setModalType={setModalType} roleModal={roleModal} setroleModal={setroleModal} setLoader={setLoader} admin={admin} setAdmin={setAdmin} roles={roles} setAdminType={setAdminType} />
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    existAdminRes: state.admin.existAdminRes,
    getAdminsRes: state.admin.getAdminsRes,
    getAdminAuth: state.admin.getAuth,
    getAdminsAuth: state.admin.getAdminsAuth,
    currentUserPermission: state.role,
    deleteAdminRes: state.admin.deleteAdminRes,
    getRolesRes: state.role.getRolesRes,
    getExistAdmin: state.admin.getExistAdmin,
});
export default connect(mapStateToProps, { getAdmin, getStaffAdmins, deleteAdmin, beforeAdmin, getRoles, getPermission })(AdminStaff);