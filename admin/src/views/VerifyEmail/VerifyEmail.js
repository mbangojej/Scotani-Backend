import {useState, useEffect} from "react";

import './VerifyEmail.css'

// react-bootstrap components
import { Button, Card, Form, Container, Col } from "react-bootstrap";
import { NavLink, useHistory } from "react-router-dom";
import { connect } from 'react-redux';
import { beforeAdmin, verifyEmail } from '../Admin/Admin.action';

import validator from 'validator';

function VerifyEmail(props) {
  const history = useHistory()
  
  useEffect(() => {
    let adminId = window.location.pathname.split('/')[3]
    props.verifyEmail(adminId)
  },[]);

  useEffect(() => {
    if(props.admin.verifyAdminAuth){
    }
  }, [props.admin.verifyAdminAuth])

  return (
    <>
      <div
        className="full-page section-image"
        data-color="black"
        data-image={require("assets/img/full-screen-image-2.jpg").default}
      >
        <div className="content d-flex align-items-center p-0">
          <Container>
            <Col className="mx-auto" lg="6" md="10">
              <Form action="" className="form" method="">
                <Card className={"card-login "}>
                  <Card.Header>
                    <h3 className="header text-center">Email Verified Successfully </h3>
                  </Card.Header>
                  <Card.Body  className="text-center">
                      <p><strong> Your Email has been verified successfully.<br></br> Kindly visit the login page to continue.</strong></p>
                  </Card.Body>
                  <Card.Footer className="ml-auto mr-auto">
                      <a className="btn-wd btn-info text-center" type="submit" href="/admin">Visit Login Page</a>
                  </Card.Footer>
                </Card>
              </Form>
            </Col>
          </Container>
        </div>
        <div
          className="full-page-background"
          style={{
            backgroundImage:
              "url(" +
              require("assets/img/full-screen-image-2.jpg").default +
              ")",
          }}
        ></div>
      </div>
    </>
  );
}

const mapStateToProps = state => ({
  admin: state.admin,
  error: state.error
});

export default connect(mapStateToProps, { beforeAdmin, verifyEmail })(VerifyEmail);
