import React from 'react';
import MainLogo from "../assets/img/logo.png";

import { Card, Container, Col } from "react-bootstrap";

function NotFound(props) {
    return (
        <>
            <div className="full-page section-image" data-color="black" data-image={require("assets/img/full-screen-image-2.jpg").default}>
                <div className="content d-flex align-items-center p-0">
                    <Container>
                        <Col className="mx-auto" lg="4" md="8">
                            <Card className="card-login">
                                <Card.Header className="text-center">
                                    <div className="logo-holder d-inline-block align-top">
                                        <img src={MainLogo} />
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Body>
                                            <h4 className="text-center">You do not have permission to access the resource.</h4>
                                            <p className="text-center"> Kindly contact Super Admin </p>
                                    </Card.Body>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Container>
                </div>
                <div className="full-page-background" style={{ backgroundImage: "url(" + require("assets/img/full-screen-image-2.jpg").default + ")", }}></div>
            </div>

        </>
    );
}


export default NotFound;