import { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { beforeActivity, getActivities } from './Activity.action';
import { Card, Table, Container, Row, Col, Accordion } from "react-bootstrap";
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import userDefaultImg from '../../assets/img/placeholder.jpg'
import { Link } from "react-router-dom";
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { ENV } from '../../config/config';
import moment from 'moment';


const Activity = (props) => {

    const [activities, setActivities] = useState([])
    const [loader, setLoader] = useState(true)
    const [pagination, setPagination] = useState(null)

    useEffect(() => {
        window.scroll(0, 0)
        props.getActivities()
    }, [])

    useEffect(() => {
        if (props.activity.activityAuth) {
            const { activity, pagination } = props.activity.activity
            setActivities([...activity])
            setPagination(pagination)
            props.beforeActivity()
        }
    }, [props.activity.activityAuth])

    useEffect(() => {
        if (activities) {
            setLoader(false)
        }
    }, [activities])

    const onPageChange = async (page) => {
        setLoader(true)
        const qs = ENV.objectToQueryString({ page })
        props.getActivities(qs)
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
                                            <Card.Title as="h4">Activities</Card.Title>
                                            {/* <p className="card-user">List Of Activities</p> */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy activity-table">
                                                <thead>
                                                     <tr>
                                                        <th className="text-center serial-col">Type</th>
                                                        <th className='text-center td-actions'>Price</th>
                                                        <th className='text-center td-actions'>From</th>
                                                        <th className="td-actions text-center">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        activities && activities.length ? activities.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="text-center serial-col">
                                                                        {
                                                                            'Creation'
                                                                        }
                                                                    </td>
                                                                    <td className="text-center td-actions">
                                                                        {item.price}
                                                                    </td>
                                                                    <td className="text-center td-actions">
                                                                        <Link to={`/users?userId=${item._id}`}>
                                                                            {item.user ? item.user.firstName ? item.user.firstName: 'User' : item.admin ? item.admin.name :'Anonymous'
                                                                                // item.user.address.slice(0, 8)
                                                                            }
                                                                        </Link> 
                                                                    </td>
                                                                    <td className='text-center td-number'>
                                                                        {moment(item.createdAt).fromNow()}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                            :
                                                            <tr>
                                                                <td colSpan="4" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Activity Found</div>
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
    activity: state.activity,
    error: state.error
});

export default connect(mapStateToProps, { beforeActivity, getActivities })(Activity)
