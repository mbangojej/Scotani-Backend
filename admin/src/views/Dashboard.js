import { useEffect, useState } from "react";
import { Card, Container, Row, Col, Table } from "react-bootstrap";
import { beforeDashboard, getDashboard } from './Dashboard.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faFile,
	faMoneyBill,
	faMoneyBillWave,
	faMoneyCheck,
	faSatelliteDish,
	faMicrochip,
	faRoad,
	faTruckMoving,
	faPeopleCarry,
	faDolly,
	faCheckSquare,
	faArrowAltCircleDown,
	faTruck,
} from '@fortawesome/free-solid-svg-icons'
import { Line } from "react-chartjs-2";
import { currencyFormat } from '../../src/utils/functions'
import moment from 'moment';
import { Link } from "react-router-dom";
import Chart from 'chart.js/auto';
import { Helmet } from 'react-helmet';

function Dashboard(props) {

	const [data, setData] = useState({
		users: 0
	})
	const [loader, setLoader] = useState(true)
	const [lineChartData, setLineChartData] = useState();

	useEffect(() => {
		props.getDashboard()
	}, [])

	useEffect(() => {
		if (props.dashboard.dataAuth) {

			const { customers, adminlist, last_orders, ordersStats, guest, invoices, orderReceived, processingOrders, onTheWayOrders, deliveredOrders, cancelledOrders } = props.dashboard.data
			setData({
				customers,
				adminlist,
				orderReceived,
				processingOrders,
				onTheWayOrders,
				deliveredOrders,
				cancelledOrders,
				last_orders,
				untaxed_amount: ordersStats[0]?.grandTotal - ordersStats[0]?.taxTotal,
				tax_total: ordersStats[0]?.taxTotal,
				paidAmount: ordersStats[0]?.paidAmount,
				guest,
				invoices
			})

			let data = []
			let labels = []

			props.dashboard.data.orderChartData.forEach((data_, index) => {
				data.push(data_.orders)
				labels.push(moment(data_.createdAt).format('MM-DD-YYYY'))
			})
			data = [...data].reverse();
			labels = [...labels].reverse();


			setLineChartData({
				labels,
				datasets: [
					{
						label: 'Sales',
						data: data,
						borderColor: 'rgb(255, 99, 132)',
						backgroundColor: 'rgba(255, 99, 132, 0.5)',
					}
				],
			})
			setLoader(false)
			props.beforeDashboard()
		}
	}, [props.dashboard.dataAuth])

	// when an error is received
	useEffect(() => {
		if (props.error.error)
			setLoader(false)
	}, [props.error.error])
	const options = {
		responsive: true,
		scales: {
			y: {
				ticks: {
					beginAtZero: true,
					callback: function (value) { if (value % 1 === 0) { return value; } }
				}
			}
		}
	};
	return (
		<div className="pt-3 pt-md-5">
			<Helmet>
				<title>Scotani | Admin Panel | Dashboard</title>
			</Helmet>
			{
				loader ?
					<FullPageLoader />
					:
					<Container fluid>
						<Row>
							<Col xl={3} lg={3} sm={6}>
								<Link to="/orders/0" target="_blank" rel="noreferrer noopener">
									<Card className="card-stats custom-card">
										<Card.Body>
											<div className="d-flex">
												<div className="numbers">
													<p className="card-category mb-2">Orders Received</p>
													<Card.Title as="h4">{data.orderReceived ? data.orderReceived : 0}</Card.Title>
												</div>
												<div className="icon-big text-center icon-warning">
													<FontAwesomeIcon icon={faArrowAltCircleDown} />
												</div>
											</div>
										</Card.Body>
									</Card>
								</Link>
							</Col>

							<Col xl={3} lg={3} sm={6}>
								<Link to="/orders/1" target="_blank" rel="noreferrer noopener">
									<Card className="card-stats custom-card">
										<Card.Body>
											<div className="d-flex">
												<div className="numbers">
													<p className="card-category mb-2">Processing Orders</p>
													<Card.Title as="h4">{data.processingOrders ? data.processingOrders : 0}</Card.Title>
												</div>
												<div className="icon-big text-center icon-warning">
													<FontAwesomeIcon icon={faDolly} />
												</div>
											</div>
										</Card.Body>
									</Card>
								</Link>
							</Col>

							<Col xl={3} lg={3} sm={6}>
								<Link to="/orders/2" target="_blank" rel="noreferrer noopener">
									<Card className="card-stats custom-card">
										<Card.Body>
											<div className="d-flex">
												<div className="numbers">
													<p className="card-category mb-2">On The Way Orders</p>
													<Card.Title as="h4">{data.onTheWayOrders ? data.onTheWayOrders : 0}</Card.Title>
												</div>
												<div className="icon-big text-center icon-warning">
													<FontAwesomeIcon icon={faTruckMoving} />
												</div>
											</div>
										</Card.Body>
									</Card>
								</Link>
							</Col>
							<Col xl={3} lg={4} sm={6}>
								<Link to="/orders/3" target="_blank" rel="noreferrer noopener">
									<Card className="card-stats custom-card">
										<Card.Body>
											<div className="d-flex">
												<div className="numbers">
													<p className="card-category mb-2">Delivered Orders</p>
													<Card.Title as="h4">{data.deliveredOrders ? data.deliveredOrders : 0}</Card.Title>
												</div>
												<div className="icon-big text-center icon-warning">
													<FontAwesomeIcon icon={faCheckSquare} />
												</div>
											</div>
										</Card.Body>
									</Card>
								</Link>
							</Col>
						</Row>
						<Row>
							<Col xl={12} sm={12}>
								<Row className="chart-row">
									<Col xl={12} lg={12} sm={12}>
										{
											lineChartData && lineChartData.labels &&
											<Line options={options} data={lineChartData}>

											</Line>
										}
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className="mt-5">
							<Col lg={12} sm={12}>
								<Card className="card-stats">
									<Card.Body>
										<Card.Title>Last 10 Orders</Card.Title>
										<div className="table-responsive">
											<Table className="table-bigboy">
												<thead>
													<tr>
														<th className="text-center serial-col">#</th>
														<th className='text-center td-actions'>Order Number</th>
														<th className='text-center td-actions'>Total</th>
														<th className="td-actions text-center">Order Date </th>
														<th className="td-actions text-center">Status</th>

													</tr>
												</thead>
												<tbody>
													{
														data.last_orders && data.last_orders.length ?
															data.last_orders.map((item, index) => {
																return (
																	<tr key={index}>
																		<td className="text-center serial-col"> {index + 1}</td>
																		<td className="text-center serial-col">  <Link target="_blank" to={`/edit-sale/${item._id}`}>{"SC" + item.orderNumber.toString().padStart(5, 0)}</Link></td>
																		<td className="text-center serial-col"> {currencyFormat(item.grandTotal.toFixed(2))}</td>
																		<td className="text-center serial-col"> {moment(item.createdAt).format('DD MMM YYYY')}</td>

																		<td className="text-center serial-col">
																			{
																				{
																					"0": <span bg="warning" class="badge badge-warning">Order Received</span>,
																					"1": <span bg="success" class="badge badge-success">Processing</span>,
																					"2": <span bg="danger" class="badge badge-success">On the Way</span>,
																					"3": <span bg="success" class="badge badge-success">Delivered</span>,
																					"4": <span bg="danger" class="badge badge-danger">Cancelled</span>,
																				}[item?.status?.toString()]
																			}
																		</td>
																	</tr>
																)
															})
															:
															<tr>
																<td colSpan="5" className="text-center">
																	<div className="alert alert-info" role="alert">No Order Found</div>
																</td>
															</tr>
													}


												</tbody>
											</Table>
										</div>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</Container>
			}
		</div>


	);
}

const mapStateToProps = state => ({
	dashboard: state.dashboard,
	user: state.user,
	error: state.error,
});

export default connect(mapStateToProps, { beforeDashboard, getDashboard })(Dashboard);
