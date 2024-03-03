import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeFaq, getFaq, updateFaq } from './Faq.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import validator from 'validator';
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { ENV } from '../../config/config'
import { beforeFAQCategory, getFAQCategories } from './Category/Category.action';
import { Helmet } from 'react-helmet';

const EditFaq = (props) => {

    const [data, setData] = useState({
    })
    const [categories, setCategories] = useState([])

    const [msg, setMsg] = useState({
        title: '',
        display_order: '',
        category: '',
        desc: '',
        titleDE: '',
        descDE: '',
    })

    const [loader, setLoader] = useState(true)

    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ all: 1, order: 1 })
        props.getFAQCategories(qs)
        props.getFaq(window.location.pathname.split('/')[3])
    }, [])

    useEffect(() => {
        if (props.faqs.getFaqAuth) {
            const { title, category, display_order, desc, titleDE, descDE, status } = props.faqs.faq


            setData({ title, category, display_order, desc, titleDE, descDE, status, _id: window.location.pathname.split('/')[3] })
            props.beforeFaq()
            setLoader(false)
        }
    }, [props.faqs.getFaqAuth])





    useEffect(() => {
        if (props.FAQcategory.getFAQCategoriesAuth) {
            const { categories } = props.FAQcategory.FAQcategories
            let categoriesArray = [];
            categories.map((category, key) => {
                categoriesArray.push({
                    label: category.name,
                    value: category._id,
                    key: key
                })
            })
            setCategories(categoriesArray)
            props.beforeFAQCategory()
        }
    }, [props.FAQcategory.getFAQCategoriesAuth])        // FAQ Category Fetched



    useEffect(() => {
        if (props.faqs.editFaqAuth) {
            props.beforeFaq()
            setLoader(false)
            props.history.push(`/faq`)
        }
    }, [props.faqs.editFaqAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const update = () => {


        if (!validator.isEmpty(data.title.trim()) && !validator.isEmpty(String(data.display_order)) && !validator.isEmpty(data.desc.trim()) && (data.category !== null && !validator.isEmpty(data.category))) {
            setMsg({
                title: '',
                category: '',
                display_order: '',
                desc: '',
            })

            setLoader(true)
            if (data.status === undefined)
                data.status = false
            let formData = new FormData()
            for (const key in data)
                formData.append(key, data[key])
            props.updateFaq(formData)
        }
        else {
            let category = ''
            let display_order = ''
            let title = ''
            let desc = ''


            if (validator.isEmpty(data.title.trim())) {
                title = 'Question is required.'
            }
            if (validator.isEmpty(String(data.display_order))) {
                display_order = 'Display order required.'
            }
            if (data.category === null || validator.isEmpty(data.category)) {
                category = 'Category is required.'
            }
            if (validator.isEmpty(data.desc.trim())) {
                desc = 'Description is required.'
            }
            setMsg({ title, category, display_order, desc })
        }
    }

    const onEditorChange = (event, editor) => {
        let editorData = editor.getData();
        setData({ ...data, desc: editorData });
    }

    const onGermanEditorChange = (event, editor) => {
        let editorData = editor.getData();
        setData({ ...data, descDE: editorData });
    }

    const handleKeyDown = (e) => {
        // Prevent the input if the key pressed is a decimal point
        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };


    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Update FAQ</title>
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
                                        <Card.Title as="h4">Edit FAQ</Card.Title>
                                    </Card.Header>
                                    <Card.Body>

                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Category<span className="text-danger"> *</span></label>

                                                    <Select options={categories}
                                                        onChange={(option) => setData({ ...data, category: option.value })}
                                                        value={categories.filter(option => option.value === data.category)}
                                                    />

                                                    <span className={msg.category ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.category}</label>
                                                    </span>
                                                </Form.Group>

                                            </Col>

                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Display Order<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={data.display_order ? data.display_order : ''}
                                                        onChange={(e) => {
                                                            if (e.target.value > 0) {
                                                                setData({ ...data, display_order: e.target.value.replace(/[^0-9]/g, '') });
                                                            } else {
                                                                setData({ ...data, display_order: '' });
                                                            }
                                                        }}
                                                        placeholder="Display Order"
                                                        min={1}
                                                        type="Number"
                                                        onKeyDown={handleKeyDown}
                                                    ></Form.Control>
                                                    <span className={msg.display_order ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.display_order}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <Form.Group>
                                                    <label>Question <span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={data.title ? data.title : ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, title: e.target.value });
                                                        }}
                                                        placeholder="Title "
                                                        type="text"
                                                    ></Form.Control>
                                                    <span className={msg.title ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.title}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>

                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <label>Answer / Description<span className="text-danger"> *</span></label>
                                                <Form.Control
                                                    as="textarea" rows={3}
                                                    value={data.desc ?? ''}
                                                    onChange={(e) => {
                                                        setData({ ...data, desc: e.target.value });
                                                    }}
                                                    placeholder="Title"
                                                    type="text"
                                                ></Form.Control>
                                                <span className={msg.desc ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.desc}</label>
                                                </span>
                                            </Col>
                                        </Row>


                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Status<span className="text-danger"> *</span></label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <input name="status" type="radio" checked={data.status} value={data.status} onChange={(e) => setData({ ...data, status: true })} />
                                                        <span className="checkmark black-checkmark"></span>
                                                        <span onChange={(e) => {
                                                            setData({ ...data, status: true });
                                                        }} ><i />Active</span>
                                                    </label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <input name="status" type="radio" checked={!data.status} value={!data.status} onChange={(e) => setData({ ...data, status: false })} />
                                                        <span className="checkmark black-checkmark"></span>
                                                        <span onChange={(e) => {
                                                            setData({ ...data, status: false });
                                                        }} ><i />Inactive</span>
                                                    </label>

                                                </Form.Group>
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

                                                <Link to={'/faq'} >
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
    FAQcategory: state.faqCategory,
    faqs: state.faqs,
    error: state.error
});

export default connect(mapStateToProps, { beforeFaq, getFaq, updateFaq, beforeFAQCategory, getFAQCategories })(EditFaq);