import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { addFaq, beforeFaq } from './Faq.action';
import { beforeFAQCategory, getFAQCategories } from './Category/Category.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import validator from 'validator';
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { ENV } from '../../config/config'
import TinyMCE from '../../components/tinyMce/tinyMCE'
import { Helmet } from 'react-helmet';

const AddFaq = (props) => {

    const [data, setData] = useState({
        title: '',
        display_order: '',
        desc: '',
        category: '',
        status: true
    })

    const [msg, setMsg] = useState({
        title: '',
        display_order: '',
        desc: '',
        category: ''
    })

    const [loader, setLoader] = useState(true)
    const [categories, setCategories] = useState([])

    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ all: 1, order: 1 })
        props.getFAQCategories(qs)
        setLoader(false)
    }, [])

    useEffect(() => {
        if (props.faqs.createAuth) {
            props.beforeFaq()
            setLoader(false)
            props.history.push(`/faq`)
        }
    }, [props.faqs.createAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])


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


    const add = () => {
        if (!validator.isEmpty(data.title.trim()) && !validator.isEmpty(data.display_order) && !validator.isEmpty(data.desc.trim()) && !validator.isEmpty(data.category)) {
            setMsg({
                title: '',
                category: '',
                display_order: '',
                desc: '',
            })

            setLoader(true)
            let formData = new FormData()
            for (const key in data)
                formData.append(key, data[key])
            props.addFaq(formData)
        }
        else {
            let title = ''
            let display_order = ''
            let desc = ''
            let category = ''
            let titleDE = ''
            let descDE = ''
            if (validator.isEmpty(data.title.trim())) {
                title = 'Question is required.'
            }
            if (validator.isEmpty(data.display_order.trim())) {
                display_order = 'Display order is required.'
            }
            if (validator.isEmpty(data.category.trim())) {
                category = 'Category is required.'
            }
            if (validator.isEmpty(data.desc.trim())) {
                desc = 'Description is required.'
            }
            setMsg({ title, category, display_order, desc, titleDE, descDE })

        }
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
                <title>Scotani | Admin Panel | Add FAQ</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy">
                                    <Card.Header>
                                        <Card.Title as="h4">Add FAQ</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Category<span className="text-danger"> *</span></label>

                                                    <Select options={categories}
                                                        onChange={(option) => {
                                                            setData({ ...data, category: option.value })
                                                            setMsg((prevMsg) => ({ ...prevMsg, category: '' }))
                                                        }}
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
                                                                setMsg((prevMsg) => ({ ...prevMsg, display_order: '' }))
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
                                                    <label>Question<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={data.title ? data.title : ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, title: e.target.value });
                                                            setMsg((prevMsg) => ({ ...prevMsg, title: '' }))
                                                        }}
                                                        placeholder="Title"
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
                                                        setMsg((prevMsg) => ({ ...prevMsg, desc: '' }))
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
                                                    <label className='mr-2'>Status<span className="text-danger"> *</span></label>
                                                    <label className="right-label-radio mb-2 mr-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name="status" type="radio" checked={data.status} value={data.status} onChange={(e) => { setData({ ...data, status: true }) }} />
                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => {
                                                                setData({ ...data, status: true });
                                                            }} ><i />Active</span>
                                                        </div>
                                                    </label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name="status" type="radio" checked={!data.status} value={!data.status} onChange={(e) => { setData({ ...data, status: false }) }} />
                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => {
                                                                setData({ ...data, status: false });
                                                            }} ><i />Inactive</span>
                                                        </div>
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
                                                    onClick={add}
                                                >
                                                    Add
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

export default connect(mapStateToProps, { addFaq, beforeFaq, beforeFAQCategory, getFAQCategories })(AddFaq);