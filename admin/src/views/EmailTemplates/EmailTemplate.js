import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeEmail, getEmail, updateEmail } from './EmailTemplates.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Container, Row, Col} from "react-bootstrap";
import validator from 'validator';
import TinyMCE from '../../components/tinyMce/tinyMCE'

const EmailTemplate = (props) => {
    const [emailData, setEmailData] = useState(null)
    const [msgCheck, setMsgCheck] = useState({
        subject: false,
        text: false
    })
    const [loader, setLoader] = useState(true)

    useEffect(() => {
        window.scroll(0, 0)
        props.getEmail(window.location.pathname.split('/')[3])
    }, [])

    useEffect(() => {
        if (props.email.getEmailAuth) {
            const { type, subject, text, _id } = props.email.email
            setEmailData({
                type,
                subject,
                text,
                _id
            })
            props.beforeEmail()
        }
    }, [props.email.getEmailAuth])

    useEffect(() => {
        if (props.email.updateAuth) {
            const { type, subject, text, _id } = props.email.email
            setEmailData({
                type,
                subject,
                text,
                _id
            })
            props.beforeEmail()
        }
    }, [props.email.updateAuth])

    useEffect(() => {
        if (emailData) {
            setLoader(false)
        }
    }, [emailData])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const update = () => {
        if (!validator.isEmpty(emailData.subject.trim()) && !validator.isEmpty(emailData.text.trim())) {
            setMsgCheck({
                subject: false,
                text: false
            })
            let formData = new FormData()
            for (const key in emailData)
                formData.append(key, emailData[key])
            props.updateEmail(formData)
        }
        else {
            if (validator.isEmpty(emailData.subject.trim())) {
                setMsgCheck({ ...msgCheck, subject: true })
            }
            if (validator.isEmpty(emailData.text.trim())) {
                setMsgCheck({ ...msgCheck, text: true })
            }
        }
    }

    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3">
                                    <Card.Header>
                                        <Card.Title as="h4">Email Template</Card.Title>
                                        <p className="card-collection">Note: Make sure you edit content using source & don't edit keywords written with special character ${} (e.g. $\{} ).</p>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Type<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={emailData.type ? emailData.type : ''}
                                                        placeholder="Type"
                                                        type="text"
                                                        disabled={true}
                                                    ></Form.Control>

                                                </Form.Group>
                                            </Col>
                                            <Col className="pl-3" md="6">
                                                <Form.Group>
                                                    <label>Subject<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={emailData.subject ? emailData.subject : ''}
                                                        onChange={(e) => {
                                                            setEmailData({ ...emailData, subject: e.target.value });
                                                        }}
                                                        placeholder="Subject"
                                                        type="text"
                                                    ></Form.Control>
                                                    <span className={msgCheck.subject ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">Subject Required</label>
                                                    </span>

                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <label>Text / Description<span className="text-danger"> *</span></label>
                                                
                                                 <TinyMCE 
                                                    value={emailData?.text || ''}
                                                    onEditorChange={(content) => {
                                                        setEmailData({ ...emailData, text: data });
                                                    }}
                                                />
                                                <span className={msgCheck.text ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">Text / Description Required</label>
                                                </span>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <Button
                                                    className="mt-3 btn-fill pull-right"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={update}
                                                >
                                                    Update
                                                </Button>
                                            </Col>
                                        </Row>

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
    error: state.error
});

export default connect(mapStateToProps, { beforeEmail, getEmail, updateEmail })(EmailTemplate);