import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import validator from 'validator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { addStaffAdmin, updateAdmin } from 'views/Admin/Admin.action';
import $ from 'jquery';
import { Button, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal, FormGroup } from "react-bootstrap";
var CryptoJS = require("crypto-js");

const StaffPermissionModal = (props) => {

    const dispatch = useDispatch()
    const [userId, setUserId] = useState('')
    const [roleId, setRole] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPasssword] = useState('')
    const [confirmPassword, setConfirmPass] = useState('')
    const [status, setStatus] = useState(true)
    const [showPassword, setShowPassword] = useState(false)

    const [roles, setRoles] = useState({})
    const [phone, setPhone] = useState('')
    const [nameMsg, setNameMsg] = useState('')
    const [phoneMsg, setPhoneMsg] = useState('')
    const [emailMsg, setEmailMsg] = useState('')
    const [passwordMsg, setPassMsg] = useState('')
    const [roleName, setRoleName] = useState('')
    const [roleMsg, setRoleMsg] = useState('')
    const [confirmPassMsg, setConfirmPassMsg] = useState('')
    const [showConfirmPassword, setConfirmPassword2] = useState(false);

    const addAdminRes = useSelector(state => state.admin.addAdminRes)
    const updateAdminRes = useSelector(state => state.admin.updateAdminRes)

    useEffect(() => {
        if (Object.keys(addAdminRes).length > 0) {
            props.setModalType(1)
            setEmpty()
            if (addAdminRes.success) {
                props.loadStaff()
                // toast.success(addAdminRes.message)
            }
            else {
                // toast.error(addAdminRes.message)
            }
        }
    }, [addAdminRes])

    useEffect(() => {
        if (Object.keys(updateAdminRes).length > 0) {
            props.setModalType(1)
            setEmpty()
        }
    }, [updateAdminRes])

    useEffect(() => {
        if (props.getExistAdmin) {
            props.setroleModal(!props.roleModal)
            setEmailMsg("Email already exist")
            setName(props.admin.name)
            setRole(props.admin.roleId)
            setEmail(props.admin.email)
            setPhone(props.admin.phone)
            setStatus(props.admin.status)
        } else {
            if (Object.keys(props.admin).length > 0) {
                if (props.modalType === 1) {
                    setEmpty()
                }
                else if (props.modalType === 2 || props.modalType === 3) {
                    setUserId(props.admin._id)
                    setName(props.admin.name)
                    setRole(props.admin.roleId)
                    setRoleName(props.admin.role.title)
                    setEmail(props.admin.email)
                    setPhone(props.admin.phone)
                    setStatus(props.admin.status)
                }

            }
        }
    }, [props.admin])

    useEffect(() => {
        if (props.roles) {
            setRoles(props.roles)
        }
    }, [props.roles])
    const setEmpty = () => {
        setName('')
        setRole('')
        setEmail('')
        setPasssword('')
        setConfirmPass('')
        setPhone('')
        setStatus(true)

        setNameMsg('')
        setRoleMsg('')
        setEmailMsg('')
        setPassMsg('')
        setPhoneMsg('')
        setConfirmPassMsg('')
    }
    const validate = (e) => {
        let check = true
        if (validator.isEmpty(name.trim())) {
            setNameMsg('Full name is Required.')
            check = false
        }
        else {
            if (!validator.isEmpty(name.trim()) && (name.trim().length < 3 || name.trim().length > 35)) {
                setNameMsg('Full name charachter length must be between 3 and 35.')
                check = false
            }
            else {
                setNameMsg('')
            }
        }
        if (validator.isEmpty(roleId)) {
            setRoleMsg('Please select a role')
            check = false
        }
        if (!validator.isEmpty(roleId)) {
            setRoleMsg('')
        }
        if (validator.isEmpty(email.trim())) {
            setEmailMsg('Email is Required.')
            check = false
        }
        else {
            if (!validator.isEmail(email)) {
                setEmailMsg('Please enter a valid email address')
                check = false
            }
            else {
                setEmailMsg('')
            }
        }
        if (!validator.isEmpty(phone.trim())) {
            const numericValue = phone.replace(/[^0-9+]/g, '');
            if (numericValue.length < 7 || numericValue.length > 15) {
                setPhoneMsg('Phone number must be between 7 and 15 digits.')
                check = false

            } else if (numericValue[0] === '0' || (numericValue[0] !== '+' && numericValue[0] === '0')) {
                setPhoneMsg('Phone number cannot start with zero')
                check = false

            }
            else {
                setPhoneMsg('')
            }
        }
        else {
            setPhoneMsg('')
        }
        if (props.modalType === 3 && (!validator.isEmpty(confirmPassword.trim()) || !validator.isEmpty(password.trim()))) {
            if (password.length < 8) {
                setPassMsg('Passwords must be at least 8 characters long');
                check = false;
            }
            else if(!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/.test(password)) {
                setPassMsg('Password must contain atleast one lower case, one upper case, one character and a number')
                check = false;
            }
            else {
                setPassMsg('')
            }
            
            if (!validator.equals(password, confirmPassword)) {
                setConfirmPassMsg('Passwords do not match')
                check = false
            }
            else {
                setConfirmPassMsg('')
            }
        }
        return check
    }
    const submit = (e) => {
        let check = validate()
        if (check) {

            let payload = { name, email, password, status, phone, roleId }
            if (props.modalType === 1) { // add modal type
                props.setLoader(true)
                let payload = { name, email, password: Math.floor(100000 + Math.random() * 900000), status, phone, roleId }
                dispatch(addStaffAdmin(payload));
            }
            else if (props.modalType === 3) { // update modal type
                props.setLoader(true)
                let payload = { name, email, password, status, phone, roleId }
                payload._id = userId
                dispatch(updateAdmin(payload));
                props.setAdminType(false)
            }
            props.setLoader(true)
            props.getData(payload)
            props.setroleModal(!props.roleModal)
        }
        else {
            $('#modal-primary').scrollTop(0, 0)
        }

    }
    const onCloseHandler = () => {
        props.setroleModal(!props.roleModal)
        setEmpty()
    }
    const showPasswordMethod = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword)
    }
    const showConfirmPasswordMethod = (e) => {
        e.preventDefault();
        setConfirmPassword2(!showConfirmPassword)
    }
    return (
        <Container fluid>
            {
                props.modalType > 0 &&
                <Modal className="modal-primary staff-modal" id="admin-modal" onHide={() => { onCloseHandler(); props.setAdmin({}) }} show={props.roleModal}>
                    <Modal.Header className="justify-content-center">
                        <Row>
                            <div className="col-12">
                                <h4 className="mb-0 mb-md-3 mt-0">
                                    {props.modalType === 1 ? 'Add New' : props.modalType === 2 ? 'View' : 'Edit'} Staff
                                </h4>
                            </div>
                        </Row>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <Form>
                            <Form.Group>
                                <label>Full Name <span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter name"
                                    disabled={props.modalType === 2}
                                    type="text"
                                    name="name"
                                    minLength={3}
                                    maxLength={35}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        setNameMsg('')
                                    }}
                                    value={name}
                                    required
                                />
                                <span className={nameMsg ? `` : `d-none`}>
                                    <label className="pl-1 text-danger">{nameMsg}</label>
                                </span>

                            </Form.Group>

                            <Form.Group>
                                <label>User Role <span className="text-danger">*</span></label>
                                <Form.Control as="select" className="form-select pr-3 mr-3" aria-label="Default select example" name="roleId" disabled={props.modalType === 2} value={roleId} onChange={(e) => {
                                    setRole(e.target.value)
                                    setRoleMsg('')
                                }} >

                                    {props.modalType === 2 ? (
                                        <option value={''}>{roleName}</option>
                                    ) : (
                                        <option value={''}>Select Role</option>
                                    )}
                                    {
                                        props.roles ?
                                            props.roles.length > 0 ?
                                                props.roles.map((role, key) => {
                                                    if (role.title != 'super admin' && role.status == true)
                                                        return (<option key={key} value={role._id}>{role.title}</option>);
                                                }) : <option value='' disabled>No role found</option>
                                            : ''
                                    }


                                </Form.Control>
                                <span className={roleMsg ? `` : `d-none`}>
                                    <label className="pl-1 text-danger">{roleMsg}</label>
                                </span>
                            </Form.Group>

                            <Form.Group>
                                <label>Email <span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="xyz@example.com"
                                    disabled={props.modalType != 1}
                                    type="text"
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
                            {
                                props.modalType === 3 ?
                                    <FormGroup>
                                        <Form.Group>
                                            <label>Password <span className="text-danger">{props.modalType === 1 ? '*' : ''}</span></label>
                                            <div className="form-password-eye-box">
                                                <Form.Control
                                                    placeholder="Password"
                                                    disabled={props.modalType === 2}
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="off"
                                                    name="password"
                                                    onChange={(e) => setPasssword(e.target.value)}
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
                                            <label>Confirm Password <span className="text-danger">{props.modalType === 1 ? '*' : ''}</span></label>
                                            <div className="form-password-eye-box">
                                                <Form.Control
                                                    placeholder="Confirm Password"
                                                    disabled={props.modalType === 2}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="off"
                                                    name="confirmPassword"
                                                    onChange={(e) => setConfirmPass(e.target.value)}
                                                    value={confirmPassword}
                                                    required
                                                />
                                                <button onClick={(e) => showConfirmPasswordMethod(e)} className="form-password-eye">
                                                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                                                </button>
                                            </div>
                                            <span className={confirmPassMsg ? `` : `d-none`}>
                                                <label className="pl-1 text-danger">{confirmPassMsg}</label>
                                            </span>

                                        </Form.Group>
                                    </FormGroup>
                                    :
                                    null
                            }



                            <Form.Group>
                                <label>Phone Number</label>
                                <Form.Control
                                    placeholder="+1234567890"
                                    disabled={props.modalType === 2}
                                    type="text"
                                    name="phone"
                                    onChange={(e) => {
                                        setPhone(e.target.value)
                                        setPhoneMsg('')
                                    }}
                                    value={phone}
                                    onKeyDown={e => ["e", "E", "-", "."].includes(e.key) && e.preventDefault()}
                                    maxLength={15}

                                />
                                <span className={phoneMsg ? `` : `d-none`}>
                                    <label className="pl-1 text-danger">{phoneMsg}</label>
                                </span>
                            </Form.Group>
                            <FormGroup >
                                <label className='d-block'>Status <span className="text-danger">*</span></label>
                                <label className={`right-label-radio mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>

                                    <div > <input disabled={props.modalType === 2} name="status" type="checkbox" checked={status} value={status} onChange={(e) => setStatus(true)} />
                                        <span className="checkmark"></span>
                                    </div>

                                    <span className='ml-2 d-inline-block' onChange={(e) => setStatus(true)} ><i />Active

                                    </span>
                                </label>
                                <label className={`right-label-radio mr-3 mb-2 ${props.modalType === 2 ? 'disabled-checkbox' : ''}`}>
                                    <span className="checkmark"></span>
                                    <div> <input disabled={props.modalType === 2} name="status" type="checkbox" checked={!status} value={!status} onChange={(e) => setStatus(false)} />
                                        <span className="checkmark"></span>
                                    </div>
                                    <span className='ml-2' onChange={(e) => setStatus(false)} ><i />Inactive</span>
                                </label>
                            </FormGroup>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button className="btn btn-warning" onClick={() => { onCloseHandler(); props.setAdmin({}) }}>Close</Button>
                        {
                            props.modalType === 2 ? '' :
                                <Button className="btn btn-info" onClick={() => { submit(); props.setAdmin({}) }} /* disabled={isLoader} */>Save</Button>
                        }
                    </Modal.Footer>
                </Modal>
            }
        </Container>

    )
}


export default StaffPermissionModal;