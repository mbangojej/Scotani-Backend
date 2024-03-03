import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { ENV } from '../../../config/config';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Swal from 'sweetalert2';
import validator from 'validator';
import { addRole, updateRole, beforeRole } from './permissions.actions';
import $ from 'jquery';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal, FormGroup } from "react-bootstrap";

const StaffPermissionModal = (props) => {
    const dispatch = useDispatch()
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState(true)
    const [selectAll, setSelectAll] = useState(false)
    const [titleMsg, setTitleMsg] = useState('')
    const [permissionMsg, setPermissionMsg] = useState('')
    const [formValid, setFormValid] = useState(false)
    const [permissions, setPermissions] = useState({
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
        //"createInvoice": false,
        "registerPayment": false,
        "addContent": false,
        "editContent": false,
        "deleteContent": false,
        "viewContents": false,

        "addDesignImprints": false,
        "editDesignImprints": false,
        "deleteDesignImprints": false,
        "viewDesignImprints": false,


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
        // status (i.e: true for active & false for in-active)

    })

    const addRoleRes = useSelector(state => state.role.addRoleRes)
    const updateRoleRes = useSelector(state => state.role.updateRoleRes)
    const authenticate = useSelector(state => state.role.authenticate)
    const existRoleRes = useSelector(state => state.role.existRoleRes)

    const onChangeCheckbox = (name, value) => {
        let roles = permissions
        if (name === 'selectAll') {
            Object.keys(roles).forEach((val, key) => {
                if (val !== 'title' && val !== '_id' && val !== 'status' && val !== 'createdAt' && val !== 'updatedAt' && val !== '_v')
                    roles = { ...roles, [val]: value }
                if (roles[key] === true && key !== 'status') {
                    setPermissionMsg('')
                }
            });
            setSelectAll(value)
        }
        else {
            roles = { ...roles, [name]: value }
            let count = 0;
            if (props.modalType === 3) {
                count = 1;
            }
            else {
                count = 0;
            }
            Object.keys(roles).forEach((key, index) => {
                if (roles[key] === true && key !== 'status') {
                    count++;
                    setPermissionMsg('')
                }
            });

            let selectCount = count === 103 ? true : false

            setSelectAll(selectCount)
        }
        setPermissions(roles)
    }
    const submit = (e) => {
        let checkPermission = false
        Object.keys(permissions).forEach((key, index) => {
            if (permissions[key] === true && key !== 'status') {
                checkPermission = true
                setPermissionMsg('')
            }
        });
        if (!checkPermission) {
            setPermissionMsg("Select at least one permission.")
            setFormValid(true)
        }
        if (title.trim() === undefined || validator.isEmpty(title.trim())) {
            setTitleMsg("Title Required.")
            $('.modal-primary').scrollTop(0, 0)
            setFormValid(true)
        }
        else {
            if (!checkPermission) {
                setPermissionMsg("Select at least one permission.")
                setFormValid(true)
            }
            else {
                if (!validator.isEmpty(title.trim()) && title.trim().length >= 3 && title.trim().length <= 50) {
                    setTitleMsg(title)
                    setPermissionMsg('')
                    setFormValid(false)
                    const role = { ...permissions, title, status }
                    if (props.modalType === 1) // add modal type
                    {
                        let check = true
                        if (check == true) {
                            props.setLoader(true)
                            dispatch(addRole(role));
                        }
                    }
                    else if (props.modalType === 3) // update modal type
                    {
                        props.setLoader(true)
                        dispatch(updateRole(role));
                    }
                    setPermissions(role)
                    props.setData(role)
                    props.setLoader(true)
                }
                else {
                    setTitleMsg("Title charachter length must be between 3 and 50.")
                    $('.modal-primary').scrollTop(0, 0)
                    setFormValid(true)
                }
            }
        }

    }
    useEffect(() => {
        if (props.existRole) {
            setPermissions(props.role)
            setTitle(props.role.title)
            setStatus(props.role.status)
            setTitleMsg("Title already exist")
        }
        else {

            if (Object.keys(props.role).length > 0) {

                if (props.modalType === 1) {
                    setEmpty()
                }
                else if (props.modalType === 2 || props.modalType === 3) {
                    setPermissions(props.role)
                    setTitle(props.role.title)
                    setStatus(props.role.status)
                }

                let roles = props.role
                let selectall = true
                // select all state settings
                Object.keys(roles).forEach((key, index) => {
                    if (roles[key] === false && key !== 'status') {
                        selectall = false
                    }
                });

                setSelectAll(selectall)

            }
        }

    }, [props.role])

    useEffect(() => {
        let roles = permissions
        let selectall = true
        // select all state settings
        Object.keys(roles).forEach((key, index) => {
            if (roles[key] === false && key !== 'status') {
                selectall = false
            }
        });

        setSelectAll(selectall)
    }, [permissions])

    useEffect(() => {
        if (props.modalType === 2) {
            $(".modal-primary input").prop("disabled", true);
        } else {
            $(".modal-primary input").prop("disabled", false);
        }
    }, [props.modalType])



    useEffect(() => {
        if (addRoleRes.success && authenticate === true) {
            props.setroleModal(!props.roleModal)

            props.setModalType('')
            props.setLoader(false)
            setEmpty()
            toast.success(addRoleRes.message);
            dispatch(beforeRole());
        }
    }, [addRoleRes])

    const onCloseHandler = () => {
        props.setroleModal(!props.roleModal)
        setEmpty()
    }
    const resetPermission = () => {
        setPermissions({
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
            // "confirmOrder": false,
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

            "addDesignImprints": false,
            "editDesignImprints": false,
            "deleteDesignImprints": false,
            "viewDesignImprints": false,


            "addContactQuery": false,
            "editContactQuery": false,
            "deleteContactQuery": false,
            "viewContactQueries": false,
            "addRole": false,
            "editRole": false,
            "deleteRole": false,
            "viewRole": false,
            // status (i.e: true for active & false for in-active)

        })
        setTitle('')
    }
    useEffect(() => {
        if (Object.keys(updateRoleRes).length > 0 && authenticate === true) {

            props.setroleModal(!props.roleModal)
            props.setModalType('')
            props.setLoader(false)
            toast.success(updateRoleRes.message);
            dispatch(beforeRole());
        }
    }, [updateRoleRes])

    const setEmpty = () => {
        setTitleMsg("")
        setPermissionMsg("")
        setTitle('')
        setStatus(true)
        resetPermission()
    }



    return (
        <Container fluid>
            {
                formValid ?
                    <div className="text-danger">Please fill the required fields</div> : null
            }
            {
                props.modalType > 0 &&
                <Modal className="modal-primary role-modal" onHide={() => {
                    onCloseHandler();
                    props.setRole({})

                }} show={props.roleModal}>
                    <Modal.Header className="justify-content-center">
                        <Row>
                            <div className="col-12">
                                <h4 className="mb-0 mb-md-3 mt-0">
                                    {props.modalType === 1 ? 'Add New' : props.modalType === 2 ? 'View' : 'Edit'} Staff Role
                                </h4>
                            </div>
                        </Row>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <Form>
                            <Form.Group>
                                <Row>
                                    <Col md={9}>
                                    </Col>
                                    <Col md={3}>
                                        <label className={`right-label-checkbox pr-0 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Select All
                                            <input type="checkbox" name="selectAll" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !selectAll)} checked={selectAll} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <label className="label-font">Title <span className="text-danger">*</span></label>
                                        <Form.Control
                                            placeholder="Enter title"
                                            type="text"
                                            name="title"
                                            onChange={(e) => {
                                                setTitle(e.target.value)
                                                setTitleMsg("")
                                            }}
                                            disabled={props.modalType === 2}
                                            minLength={3}
                                            maxLength={50}
                                            value={title}
                                            required
                                        />
                                        <span className={titleMsg ? `` : `d-none`}>
                                            <label className="pl-1 text-danger">{titleMsg}</label>
                                        </span>
                                    </Col>


                                </Row>
                            </Form.Group>


                            <label className="label-font">Permissions <span className="text-danger">*</span></label>



                            <Form.Group>
                                <Row>

                                    <Col md={12}>
                                        <label className="label-font-permission-heading">ADMIN STAFF</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">Admin Staff</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap" >
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewAdmin" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewAdmin)} checked={permissions.viewAdmin} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addAdmin" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addAdmin)} checked={permissions.addAdmin} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editAdmin" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editAdmin)} checked={permissions.editAdmin} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteAdmin" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteAdmin)} checked={permissions.deleteAdmin} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Roles</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewRole" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewRole)} checked={permissions.viewRole} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addRole" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addRole)} checked={permissions.addRole} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editRole" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editRole)} checked={permissions.editRole} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteRole" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteRole)} checked={permissions.deleteRole} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>

                                    <Col md={12}>
                                        <label className="label-font-permission-heading">CUSTOMERS</label>
                                    </Col>

                                    <Col md={3}>
                                        <label className="label-font-permission">Customers</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewCustomer" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewCustomer)} checked={permissions.viewCustomer} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addCustomer" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addCustomer)} checked={permissions.addCustomer} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editCustomer" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editCustomer)} checked={permissions.editCustomer} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteCustomer" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteCustomer)} checked={permissions.deleteCustomer} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <label className="label-font-permission-heading">PRODUCTS</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">Products</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewProducts" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewProducts)} checked={permissions.viewProducts} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addProduct" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addProduct)} checked={permissions.addProduct} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editProduct" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editProduct)} checked={permissions.editProduct} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteProduct" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteProduct)} checked={permissions.deleteProduct} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Categories</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewCategories" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewCategories)} checked={permissions.viewCategories} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addCategory)} checked={permissions.addCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editCategory)} checked={permissions.editCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteCategory)} checked={permissions.deleteCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Promotions</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewPromotions" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewPromotions)} checked={permissions.viewPromotions} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addPromotion" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addPromotion)} checked={permissions.addPromotion} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editPromotion" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editPromotion)} checked={permissions.editPromotion} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deletePromotion" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deletePromotion)} checked={permissions.deletePromotion} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Size Groups</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewSizeGroups" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewSizeGroups)} checked={permissions.viewSizeGroups} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addSizeGroup" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addSizeGroup)} checked={permissions.addSizeGroup} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editSizeGroup" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editSizeGroup)} checked={permissions.editSizeGroup} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteSizeGroup" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteSizeGroup)} checked={permissions.deleteSizeGroup} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Design Imprints</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewDesignImprints" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewDesignImprints)} checked={permissions.viewDesignImprints} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addDesignImprints" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addDesignImprints)} checked={permissions.addDesignImprints} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editDesignImprints" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editDesignImprints)} checked={permissions.editDesignImprints} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteDesignImprints" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteDesignImprints)} checked={permissions.deleteDesignImprints} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>


                            </Form.Group>
                            <Form.Group>
                                <Row>

                                    <Col md={12}>
                                        <label className="label-font-permission-heading">ORDERS</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">Orders</label>
                                    </Col>

                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewOrders" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewOrders)} checked={permissions.viewOrders} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addOrder" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addOrder)} checked={permissions.addOrder} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editOrder" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editOrder)} checked={permissions.editOrder} />
                                            <span className="checkmark"></span>
                                        </label>
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Confirm
                                            <input type="checkbox" name="confirmOrder" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.confirmOrder)} checked={permissions.confirmOrder} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Cancel
                                            <input type="checkbox" name="cancelOrder" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.cancelOrder)} checked={permissions.cancelOrder} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Create Invoice
                                            <input type="checkbox" name="createInvoice" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.createInvoice)} checked={permissions.createInvoice} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Register Payment
                                            <input type="checkbox" name="registerPayment" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.registerPayment)} checked={permissions.registerPayment} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <label className="label-font-permission-heading">REPORTING</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">Sales Report</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewSalesReport" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewSalesReport)} checked={permissions.viewSalesReport} />
                                            <span className="checkmark"></span>
                                        </label>

                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Invoice Report</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">

                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewInvoiceReport" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewInvoiceReport)} checked={permissions.viewInvoiceReport} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group>
                                <Row>

                                    <Col md={12}>
                                        <label className="label-font-permission-heading">BUG REPORT</label>
                                    </Col>

                                    <Col md={3}>
                                        <label className="label-font-permission">Bug Report</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewBugReport" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewBugReport)} checked={permissions.viewBugReport} />
                                            <span className="checkmark"></span>
                                        </label>

                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Reply
                                            <input type="checkbox" name="replyBugReport" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.replyBugReport)} checked={permissions.replyBugReport} />
                                            <span className="checkmark"></span>
                                        </label>

                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group>

                                <Row>
                                    <Col md={12}>
                                        <label className="label-font-permission-heading">FAQ</label>
                                    </Col>

                                    <Col md={3}>
                                        <label className="label-font-permission">FAQ Categories</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewFaqCategories" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewFaqCategories)} checked={permissions.viewFaqCategories} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addFaqCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addFaqCategory)} checked={permissions.addFaqCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editFaqCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editFaqCategory)} checked={permissions.editFaqCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteFaqCategory" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteFaqCategory)} checked={permissions.deleteFaqCategory} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>

                                </Row>

                                <Row>

                                    <Col md={3}>
                                        <label className="label-font-permission">FAQs</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewFaqs" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewFaqs)} checked={permissions.viewFaqs} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addFaq" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addFaq)} checked={permissions.addFaq} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editFaq" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editFaq)} checked={permissions.editFaq} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteFaq" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteFaq)} checked={permissions.deleteFaq} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <label className="label-font-permission-heading">EMAIL TEMPLATE</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">Email Template</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewEmailTemplate" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewEmailTemplate)} checked={permissions.viewEmailTemplate} />
                                            <span className="checkmark"></span>
                                        </label>
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addEmailTemplate" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addEmailTemplate)} checked={permissions.addEmailTemplate} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editEmailTemplate" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editEmailTemplate)} checked={permissions.editEmailTemplate} />
                                            <span className="checkmark"></span>
                                        </label>
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteEmailTemplate" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteEmailTemplate)} checked={permissions.deleteEmailTemplate} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                    </Col>
                                </Row>

                            </Form.Group>

                            <Form.Group>

                                <Row>

                                    <Col md={12}>
                                        <label className="label-font-permission-heading">CONFIGURATION</label>
                                    </Col>
                                    <Col md={3}>
                                        <label className="label-font-permission">CMS Pages</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewCMS" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewCMS)} checked={permissions.viewCMS} />
                                            <span className="checkmark"></span>
                                        </label>
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addCMS" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addCMS)} checked={permissions.addCMS} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editCMS" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editCMS)} checked={permissions.editCMS} />
                                            <span className="checkmark"></span>
                                        </label>
                                        {/* <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteCMS" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteCMS)} checked={permissions.deleteCMS} />
                                            <span className="checkmark"></span>
                                        </label> */}
                                    </Col>
                                </Row>



                                <Row>
                                    <Col md={3}>
                                        <label className="label-font-permission">Site Settings</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewSetting" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewSetting)} checked={permissions.viewSetting} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editSetting" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editSetting)} checked={permissions.editSetting} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                            </Form.Group>


                            {/* <Form.Group>
                                <Row>
                                    <Col md={3}>
                                        <label className="label-font">Email Types</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap justify-content-between">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewEmailType" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewEmailType)} checked={permissions.viewEmailType} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Add
                                            <input type="checkbox" name="addEmailType" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.addEmailType)} checked={permissions.addEmailType} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editEmailType" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editEmailType)} checked={permissions.editEmailType} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Delete
                                            <input type="checkbox" name="deleteEmailType" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.deleteEmailType)} checked={permissions.deleteEmailType} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                            </Form.Group> */}


                            {/* <Form.Group>
                                <Row>
                                    <Col md={3}>
                                        <label className="label-font">Email Templates</label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap">
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>View
                                            <input type="checkbox" name="viewSetting" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.viewEmails)} checked={permissions.viewEmails} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-checkbox mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Edit
                                            <input type="checkbox" name="editSetting" disabled={props.modalType === 2} onChange={(e) => onChangeCheckbox(e.target.name, !permissions.editEmails)} checked={permissions.editEmails} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                            </Form.Group> */}








                            <FormGroup>
                                <Row>
                                    <Col md={3}>
                                        <label className="label-font">Status <span className="text-danger">*</span></label>
                                    </Col>
                                    <Col md={9} className="check-inline d-flex flex-wrap" >
                                        <label className={`right-label-radio mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Active
                                            <input name="status" disabled={props.modalType === 2} type="radio" checked={status} value={status} onChange={(e) => setStatus(true)} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <label className={`right-label-radio mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>Inactive
                                            <input name="status" disabled={props.modalType === 2} type="radio" checked={!status} value={!status} onChange={(e) => setStatus(false)} />
                                            <span className="checkmark"></span>
                                        </label>
                                    </Col>
                                </Row>
                            </FormGroup>

                        </Form>

                        <span className={permissionMsg ? `` : `d-none`}>
                            <label className="pl-1 text-danger">{permissionMsg}</label>
                        </span>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button className="btn btn-warning" onClick={(e) => { onCloseHandler(); props.setRole({}) }}>Close</Button>
                        {props.modalType === 2 ? '' :
                            <Button className="btn btn-info" onClick={() => { submit(); props.setRole({}) }} /* disabled={isLoader} */>Save</Button>
                        }
                    </Modal.Footer>
                </Modal>
            }
        </Container>
    )
}

export default StaffPermissionModal;