import React, { useState, useEffect, useRef } from 'react';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { addContent, getContent, updateContent } from './cms.action';
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap";
import validator from 'validator';
import userDefaultImg from '../../assets/img/default-user-icon-13.jpg';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import TinyMCE from '../../components/tinyMce/tinyMCE'
import { ENV } from '../../config/config';
import { Helmet } from 'react-helmet';
const AddContentPage = (props) => {

    const dispatch = useDispatch()
    const [title, setTitle] = useState('')
    const [image, setImage] = useState('')
    const [slug, setSlug] = useState('')
    const [formKeyWord, setFormKeyWord] = useState('')
    const [description, setDescription] = useState()
    const [status, setStatus] = useState(true)
    const [header, setHeader] = useState(false)
    const [footer, setFooter] = useState(false)
    const [contentId, setContentId] = useState('')
    const [loader, setLoader] = useState(true)
    // let slug = useRef()
    const addContentPageRes = useSelector(state => state.content.addContentRes)
    const getContentRes = useSelector(state => state.content.getContentRes)
    const updateContentRes = useSelector(state => state.content.editContentRes)

    const [msg, setMsg] = useState({
        title: '',
        slug: '',
        image: '',
        desc: '',
    })
    const [isPathEdit, setIsPathEdit] = useState(false)


    useEffect(() => {
        window.scroll(0, 0)
        setLoader(false)
        let path = window.location.pathname.split('/')
        if (path.includes('edit-cms')) {
            setIsPathEdit(true)
            let contentId = props.match.params.contentId
            setContentId(contentId)
            dispatch(getContent(contentId))
        }

    }, [])

    useEffect(() => {
        if (addContentPageRes && Object.keys(addContentPageRes).length > 0) {
            setLoader(false)
            props.history.push('/cms')

        }

    }, [addContentPageRes])

    useEffect(() => {


        if (Object.keys(getContentRes).length > 0) {

            let data = getContentRes.content
            setTitle(data.title)
            setSlug(data.slug)
            setImage(data.image)
            setDescription(data.description)
            setFormKeyWord(data.formKeyWord)
            setStatus(data.status)
            setHeader(data.header)
            setFooter(data.footer)
        }
    }, [getContentRes])

    useEffect(() => {
        if (updateContentRes.success && Object.keys(updateContentRes.length > 0)) {
            setLoader(false)
            props.history.push('/cms')
        }
    }, [updateContentRes])

    const addContentPageHandler = (type) => {
        if (!validator.isEmpty(title.trim()) && !validator.isEmpty(description.trim())) {
            setLoader(true)
            setMsg({
                title: '',
                slug: '',
                image: '',
                desc: '',
            })
            let payload = {
                title,
                slug,
                description,
                image,
                status,
            }
            if (type === 1) {
                dispatch(addContent(payload))
            }
            if (type === 2) {
                payload._id = contentId
                dispatch(updateContent(payload))
            }
        }
        else {
            let title = ''
            let slug = ''
            let desc = ''
            if (validator.isEmpty(title.trim())) {
                title = 'Title Required.'
            }
            if (validator.isEmpty(slug.trim())) {
                slug = 'Slug Required.'
            }
            if (validator.isEmpty(desc.trim())) {
                desc = 'Description Required.'
            }
            setMsg({ title, slug, desc })
        }

    }
    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | {isPathEdit ?  "Update":"Add"} CMS Page</title>
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
                                        <Card.Title as="h4">{isPathEdit ? 'Edit Content Page' : 'Add Content Page'}</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="6">
                                                <Row>
                                                    <Col md="6">
                                                        <Form.Group>
                                                            <label>Title<span className="text-danger"> *</span></label>


                                                            <Form.Control
                                                                readOnly={true}
                                                                value={title ? title : ''}
                                                                placeholder="Title"
                                                                type="text"
                                                            ></Form.Control>

                                                            <span className={msg.title ? `` : `d-none`}>
                                                                <label className="pl-1 text-danger">{msg.title}</label>
                                                            </span>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md="6">
                                                        <Form.Group>
                                                            <label>Slug<span className="text-danger"> </span></label>
                                                                <Form.Control
                                                                    readOnly={true}
                                                                    value={slug ? slug : ''}
                                                                    // onChange={(e) => setSlug(e.target.value.replace(/[|&;$%@"<>()+,*!#^~_]/g, "").replace(/\s/g, '').replace(/--/g, '-').toLowerCase())}
                                                                    placeholder="Slug"
                                                                    type="text"
                                                                ></Form.Control>

                                                        
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <label>Text / Description <span className="text-danger"> *</span></label>

                                                <TinyMCE
                                                    value={description ? description : ''}
                                                    onEditorChange={(content) => {
                                                        setDescription(content)
                                                        setMsg((prevMsg) => ({ ...prevMsg, desc: '' }))
                                                    }}
                                                />


                                                <span className={msg.desc ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.desc}</label>
                                                </span>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="6">
                                                <Form.Group className='d-flex align-items-center mt-4'>
                                                    <label>Status<span className="text-danger mr-1"> *</span></label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <input name="status" type="radio" checked={status} value={status} onChange={() => setStatus(true)} />
                                                        <span className="checkmark black-checkmark"></span>
                                                        <span className='ml-1' onChange={(e) => setStatus(true)} ><i />Active</span>
                                                    </label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <input name="status" type="radio" checked={!status} value={!status} onChange={(e) => setStatus(false)} />
                                                        <span className="checkmark black-checkmark"></span>
                                                        <span className='ml-1' onChange={(e) => setStatus(false)} ><i />Inactive</span>
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
                                                    onClick={() => addContentPageHandler(isPathEdit ? 2 : 1)}
                                                >
                                                    {isPathEdit ? 'Update' : 'Add'}
                                                </Button>
                                                <Link to={'/cms'} >
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



export default AddContentPage;