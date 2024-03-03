import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeEmail, getEmails } from './EmailTemplates.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
var CryptoJS = require("crypto-js");


const EmailTemplates = (props) => {
    const [emails, setEmails] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})


    useEffect(() => {
        window.scroll(0, 0)
        props.getEmails()
        let roleEncrypted = localStorage.getItem('role');
		let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
			role = roleDecrypted
		}
        props.getRole(role)
    }, [])

    useEffect(()=>{
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    },[props.getRoleRes])


    useEffect(() => {
        if (props.email.getAuth) {
            const { emails, pagination } = props.email
            setEmails(emails)
            setPagination(pagination)
            props.beforeEmail()
        }
    }, [props.email.getAuth])

    useEffect(() => {
        if (emails) {
            setLoader(false)
        }
    }, [emails])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getEmails(qs)
    }

    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Email Templates</Card.Title>
                                            {/* <p className="card-collection">List Of Email Templates</p> */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th>Type</th>
                                                        <th>Subject</th>                                      
                                                        <th className="td-actions">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        emails && emails.length ?
                                                            emails.map((email, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                        
                                                                        <td >
                                                                            {email.type}
                                                                        </td>
                                                                        <td >
                                                                            {email.subject}
                                                                        </td>
                                                        
                                                                        {
                                                                            permissions && permissions.editEmails &&
                                                                            <td className="td-actions float-right">
                                                                            <ul className="list-unstyled mb-0">
                                                                                <li className="d-inline-block align-top d-flex">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button"
                                                                                            variant="success" title="Edit"
                                                                                            onClick={() => {
                                                                                                setLoader(true);
                                                                                                props.history.push(`/email-template/${email._id}`);
                                                                                            }}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                </li>
                                                                            </ul>
                                                                            </td>   
                                                                        }
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="4" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Email Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            {
                                                pagination &&
                                                <Pagination
                                                    className="m-3"
                                                    defaultCurrent={1}
                                                    pageSize // items per page
                                                    current={pagination.page} // current active page
                                                    total={pagination.pages} // total pages
                                                    onChange={onPageChange}
                                                    locale={localeInfo}
                                                />
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
    email: state.email,
    error: state.error,
    getRoleRes: state.role.getRoleRes

});

export default connect(mapStateToProps, { beforeEmail, getEmails , getRole})(EmailTemplates);