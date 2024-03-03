import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeAdmin, login } from '../Admin/Admin.action'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import { NavLink } from "react-router-dom";
import MainLogo from "../../assets/img/logo.png";
import { getRoles } from 'views/AdminStaff/permissions/permissions.actions';
import { toast } from 'react-toastify';
import validator from 'validator';
var CryptoJS = require("crypto-js");

// react-bootstrap components
import { Badge, Button, Card, Form, Navbar, Nav, Container, Col } from "react-bootstrap";

function Login(props) {
    const [msg, setMsg] = useState({
        email: '',
        password: ''
    })
    const [user, setUser] = useState({ email: '', password: '' })
    const [loader, setLoader] = useState(false)
    const [permissions, setPermissions] = useState({})

    // when response from login is received
    useEffect(() => {
        if (props.admin.loginAdminAuth) {
            let roleId = props.admin.admin?.data?.roleId
            var encryptedRole = CryptoJS.AES.encrypt(roleId, 'skincanvas123#key').toString();
            localStorage.setItem('role', encryptedRole);
            localStorage.setItem('userID', props.admin.admin?.data?._id);
            localStorage.setItem('userName', props.admin.admin?.data?.name);
            props.history.push('/dashboard')

        }
    }, [props.admin.loginAdminAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    useEffect(() => {
        if (Object.keys(props.getRolesRes).length > 0) {
            setPermissions(props.getRolesRes.data)
        }
    }, [props.getRolesRes])

    const onChange = (e) => {
        let { name, value } = e.target
        let data = user
        data[name] = value
        setUser({ ...data })
    }

    const submit = async (e) => {
        e.preventDefault();
        if (!validator.isEmpty(user.email.trim()) && !validator.isEmpty(user.password.trim()) && validator.isEmail(user.email)) {
            setMsg({
                email: '',
                password: ''
            })
            if (user.email && user.password) {
                setLoader(true)
                props.login(user)
            }
        }
        else {
            let email = ''
            let password = ''

            setMsg({
                email: validator.isEmpty(user.email.trim()) ? 'Email is required' : !validator.isEmpty(user.email.trim()) && !validator.isEmail(user.email) ? 'Please input valid email' : '',
                password : validator.isEmpty(user.password.trim()) ? 'Password is required' : '',
            })

        }
    }

    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <div className="full-page section-image" data-color="black" data-image={require("assets/img/full-screen-image-2.jpg").default}>
                        <div className="content d-flex align-items-center p-0">
                            <Container>
                                <Form onSubmit={(e) => submit(e)}>
                                    <Col className="mx-auto" lg="4" md="8">

                                        <Card className="card-login">
                                            <Card.Header className="text-center">
                                                <div className="logo-holder d-inline-block align-top">
                                                    <img src={MainLogo} />
                                                </div>
                                            </Card.Header>
                                            <Card.Body>
                                                <Card.Body>
                                                    <Form.Group>
                                                        <label>Email address <span className="text-danger">*</span></label>
                                                        <Form.Control placeholder="Enter email" type="email" name="email" onChange={(e) => onChange(e)} defaultValue={user.email} autoFocus ={true} />
                                                        <span className={msg.email ? `` : `d-none`}>
                                                            <label className="pl-1 text-danger">{msg.email}</label>
                                                        </span>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <label>Password <span className="text-danger">*</span></label>
                                                        <Form.Control placeholder="Enter Password" type="password" name="password" onChange={(e) => onChange(e)} defaultValue={user.password} />
                                                        <span className={msg.password ? `` : `d-none`}>
                                                            <label className="pl-1 text-danger">{msg.password}</label>
                                                        </span>
                                                    </Form.Group>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <Form.Check className="pl-0"></Form.Check>
                                                        <NavLink to="/forgot-password" className="btn-no-bg" type="submit" variant="warning">
                                                            Forgot Password ?
                                                        </NavLink>
                                                    </div>
                                                </Card.Body>
                                            </Card.Body>
                                            <Card.Footer className="ml-auto mr-auto">
                                                <button type="submit" className="btn-wd btn-info"  disabled={loader} onClick={() => submit()}>Login</button>
                                            </Card.Footer>
                                        </Card>

                                    </Col>
                                </Form>
                            </Container>
                        </div>
                        <div className="full-page-background" style={{ backgroundImage: "url(" + require("assets/img/full-screen-image-2.jpg").default + ")", }}></div>
                    </div>

            }
        </>
    );
}

const mapStateToProps = state => ({
    admin: state.admin,
    error: state.error,
    getRolesRes: state.role.getRolesRes

});

export default connect(mapStateToProps, { beforeAdmin, login, getRoles })(Login);