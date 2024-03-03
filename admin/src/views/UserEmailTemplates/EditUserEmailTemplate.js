import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeUserEmailTemplate, getUserEmailTemplate, updateUserEmailTemplate, getEmailTypes, getUserEmailTemplates } from './UserEmailTemplate.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import TinyMCE from '../../components/tinyMce/tinyMCE'

import validator from 'validator';
import { Link } from 'react-router-dom';
import Select from "react-select";
import { Helmet } from 'react-helmet';


const EditUserEmailTemplate = (props) => {

    const [data, setData] = useState({
    })

    const [emailTemplates, setEmailTemplates] = useState(null)

    const [msg, setMsg] = useState({
        title: '',
        content: '',
        type: '',
        subject: '',
    })

    const [typesOptions, setTypesOptions] = useState([]);

    const [loader, setLoader] = useState(true)

    const [emailTypes, setEmailTypes] = useState([])


    useEffect(() => {
        if (props.UserEmailTemplate.getUserEmailTemplateAuth) {
            const { _id, title, type, subject, content } = props.UserEmailTemplate.getUserEmailTemplate.emailTemplates
            setData({ _id, title, type, subject, content, _id: window.location.pathname.split('/')[3] })
            props.getEmailTypes()
            props.beforeUserEmailTemplate()
            setLoader(false)
        }
    }, [props.UserEmailTemplate.getUserEmailTemplateAuth])

    useEffect(() => {

        window.scroll(0, 0)
        props.getUserEmailTemplate(window.location.pathname.split('/')[3])
        props.getUserEmailTemplates()
        props.getEmailTypes()
    }, [])


    useEffect(() => {
        if (props.UserEmailTemplate.getUserEmailTemplatesAuth) {
            const { emailTemplate, pagination } = props.UserEmailTemplate.userEmailTemplateList
            setEmailTemplates(emailTemplate)
        }
    }, [props.UserEmailTemplate.getUserEmailTemplatesAuth, props.UserEmailTemplate.userEmailTemplateList])

    useEffect(() => {
        if (emailTypes !== undefined) {
            let tempTypesOptions = [];
            for (var key in emailTypes) {
                tempTypesOptions.push({
                    label: emailTypes[key].title,
                    value: emailTypes[key].title,
                    key: key
                })
            }
            setTypesOptions(tempTypesOptions)
        }
    }, [emailTypes])

    useEffect(() => {

        if (props.UserEmailTemplate.getUserEmailTypesAuth) {
            let { emailTemplate } = props.UserEmailTemplate.userEmailTypes
            setEmailTypes(emailTemplate)
        }
    }, [props.UserEmailTemplate.getUserEmailTypesAuth])



    useEffect(() => {
        if (props.UserEmailTemplate.editUserEmailTemplateAuth) {
            props.beforeUserEmailTemplate()
            setLoader(false)
            props.history.push(`/user-email-templates`)
        }
    }, [props.UserEmailTemplate.editUserEmailTemplateAuth])


    const update = () => {

        if (data.title &&
            data.type &&
            data.subject &&
            data.content &&
            !validator.isEmpty(data.title) &&
            !validator.isEmpty(data.type) &&
            !validator.isEmpty(data.subject) &&
            !validator.isEmpty(data.content)) {


            let type = ''
            let check = true
            if (emailTemplates.length > 0) {
                emailTemplates.map((item, index) => {
                    if (item.type.toUpperCase().replace(/\s/g, '').trim() === data.type.toUpperCase().replace(/\s/g, '').trim() && item._id !== data._id) {
                        type = 'Type already created.'
                        setMsg({ type })
                        check = false
                    }
                })
            }

            if (check && type !== 'Type already created') {

                setMsg({
                    title: '',
                    content: '',
                    type: '',
                    subject: '',
                })

                setLoader(true)
                let formData = new FormData()
                for (const key in data)
                    formData.append(key, data[key])
                props.updateUserEmailTemplate(formData)
            }
        }
        else {
            setMsg({
                title: validator.isEmpty(data.title) ? 'Title is required' : '',
                type: validator.isEmpty(data.type) ? 'Type is required' : '',
                content: validator.isEmpty(data.content) ? 'Content is required' : '',
                subject: validator.isEmpty(data.subject) ? 'Subject is required' : '',
            })

        }
    }

    const onEditorChange = (event, editor) => {
        let editorData = event.editor.getData()
        setData({ ...data, content: editorData });
    }

    const setSelectedOption = (event) => {
        setData({
            ...data, type: event.value
        });
    }

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            cursor: 'not-allowed', // Use 'not-allowed' as a string
        }),
    };

    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Update Email Form</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3">
                                    <Card.Header>
                                        <Card.Title as="h4">Edit Email Template</Card.Title>
                                    </Card.Header>
                                    <Card.Body>

                                        <Row>
                                            <Col md="6">
                                                <Form.Group className="not-allowed">
                                                    <label>Type<span className="text-danger"> *</span></label>
                                                    <Select

                                                        defaultValue={data.type} onChange={setSelectedOption}
                                                        options={typesOptions}
                                                        value={typesOptions.filter(option => option.value === data.type)}
                                                        isDisabled={true}
                                                    />
                                                    <span className={msg.type ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.type}</label>
                                                    </span>
                                                </Form.Group>

                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Title<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        readOnly
                                                        value={data.title ? data.title : ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, title: e.target.value });
                                                        }}
                                                        placeholder="Title"
                                                        type="text"
                                                        style={{ background: '#F2F2F2' }}
                                                    ></Form.Control>
                                                    <span className={msg.title ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.title}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Subject<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={data.subject ? data.subject : ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, subject: e.target.value });
                                                        }}
                                                        placeholder="Subject"
                                                        type="text"
                                                    ></Form.Control>
                                                    <span className={msg.subject ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.subject}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="12">
                                                <label>Content<span className="text-danger"> *</span></label>
                                                <TinyMCE
                                                    value={data.content ? data.content : ''}
                                                    onEditorChange={(content) => {
                                                        setData({ ...data, content: content });
                                                    }}
                                                />
                                                <span className={msg.content ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.content}</label>
                                                </span>
                                            </Col>
                                        </Row>


                                        <Row>
                                            <Col md="12" sm="6">
                                                <Button
                                                    className="btn-fill pull-right mt-3 float-right"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={update}
                                                >
                                                    Update
                                                </Button>

                                                <Link to={'/user-email-templates'} >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>
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
    UserEmailTemplate: state.UserEmailTemplate,
    error: state.error
});

export default connect(mapStateToProps, { getUserEmailTemplates, getUserEmailTemplate, updateUserEmailTemplate, beforeUserEmailTemplate, getEmailTypes })(EditUserEmailTemplate);