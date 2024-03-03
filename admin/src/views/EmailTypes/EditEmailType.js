import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeEmailType, getEmailType, updateEmailType, getEmailTypes } from './EmailType.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import validator from 'validator';
import { Link } from 'react-router-dom';
import Select from "react-select";

import { useParams } from "react-router-dom";

const EditUserEmailTemplate = (props) => {
    const [data, setData] = useState({
    })
    const { emailTypeId } = useParams();
    const [emailTypes, setEmailTypes] = useState(null)

    const [msg, setMsg] = useState({
        title: '',
     
    })


    const [loader, setLoader] = useState(true)


    useEffect(() => {
        window.scroll(0, 0)
        props.getEmailTypes()
        props.getEmailType(window.location.pathname.split('/')[3])
    }, [])

    useEffect(()=> {
        if(props.EmailType.getEmailTypesAuth) {
            const {emailTemplate, pagination} =  props.EmailType.emailTypes
            // setPagination(pagination)
            // setData(emailTemplate)
            setEmailTypes(emailTemplate)
        }
    }, [props.EmailType.getEmailTypesAuth, props.EmailType.emailTypes])
    

    useEffect(() => {
        if (props.EmailType.getEmailTypeAuth) {
            const { title } = props.EmailType.getEmailType.emailTypes
            setData({ title, _id: window.location.pathname.split('/')[3] })
            props.beforeEmailType()
            setLoader(false)
        }
    }, [props.EmailType.getEmailTypeAuth])



    useEffect(() =>{
        if(props.EmailType.editEmailTypeAuth){
            props.beforeEmailType()
            setLoader(false)
            props.history.push(`/email-types`)
        }
    }, [props.EmailType.editEmailTypeAuth])

    
    const update = () => {
        if (!validator.isEmpty(data.title)) {

            let  title = ''
            let check = true
            if(emailTypes.length > 0){
                emailTypes.map((item, index) => {
                   if(item.title.toUpperCase().replace(/\s/g, ' ').trim() === data.title.toUpperCase().replace(/\s/g, ' ').trim() && item._id!=emailTypeId){
                    title = 'Title already exist.'
                    setMsg({title})
                    check = false
                   }
                })
            }
            
            if(check && title !== 'Title already exist.')
              {
                setMsg({
                    title: ''
                })
                setLoader(true)
                let formData = new FormData()
                for (const key in data)
                    formData.append(key, data[key])
                props.updateEmailType(formData)
              } 

            // setMsg({
            //     title: '',  
            // })
            // if(data.title === undefined)
            //     data.title = false
             
        
            //     setLoader(true)
            // let formData = new FormData()
            // for (const key in data)
            //     formData.append(key, data[key])
            // props.updateEmailType(formData)
        }
        else {
            let  title = ''
             if (validator.isEmpty(data.title)) {
                 title = 'Title Required.'
             }  
             setMsg({ title })
     
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
                                        <Card.Title as="h4">Edit Email Type</Card.Title>
                                    </Card.Header>
                                    <Card.Body>

                                    <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label>Title<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={data.title ? data.title : ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, title: e.target.value });
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
                                                <Button
                                                    className="btn-fill pull-right mt-3 float-right"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={update}
                                                >
                                                    Update
                                                </Button>
                                                
                                                <Link to={'/email-types'}  >
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
    EmailType: state.EmailType,
    error: state.error
});

export default connect(mapStateToProps, { getEmailType, updateEmailType, beforeEmailType, getEmailTypes })(EditUserEmailTemplate);