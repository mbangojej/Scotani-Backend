import React, { useState, useEffect } from 'react';
import { connect , useDispatch} from 'react-redux';
import { ENV } from '../../config/config';
import { beforeUser, getUsers, deleteUser , createUser , editUser} from './Users.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import userDefaultImg from '../../assets/img/placeholder.jpg'
import validator from 'validator';
import DatePicker from 'react-date-picker';

const PlayerUser = (props) => {
    const dispatch = useDispatch()
    const [Page , setPage] = useState(1)
    const [users, setUsers] = useState(null)
    const [formValid, setFormValid] = useState(false)
    ///Msg
    const [profileImageMsg , setProfileImageMsg] = useState('')
    const [usernameMsg , setUsernameMsg] = useState('')
    const [emailMsg , setEmailMsg] = useState('')
    const [passwordMsg , setPasswordMsg] = useState('')
    const [confirmPasswordMsg , setConfirmPasswordMsg] = useState('')
    const [facebookLinkMsg , setFacebookLinkMsg] = useState('')
    const [twitterLinkMsg , setTwitterLinkMsg] = useState('')
    const [gPlusLinkMsg , setGplusLinkMsg] = useState('')
    const [vineLinkMsg , setVineLinkMsg] = useState('')
    //user properties
    const [profileImage , setProfileImage] = useState('')
    const [username , setUsername] = useState('')
    const [email ,setEmail] = useState('')
    const [password , setPassword] = useState('')
    const [confirmPassword , setConfirmPassword] = useState('')
    const [facebookLink , setFacebookLink] = useState('')
    const [twitterLink , setTwitterLink] = useState('')
    const [gPlusLink , setGplusLink] = useState('')
    const [vineLink , setVineLink] = useState('')
    //General
    const [pagination, setPagination] = useState(null)
    const [userModal, setUserModal] = useState(false)
    const [modalType, setModalType] = useState(0)
    const [user, setUser] = useState(null)
    const [loader, setLoader] = useState(true)
    const [searchUsername, setSearchName] = useState(localStorage.getItem('users_name') !== undefined && localStorage.getItem('users_name') !== null? localStorage.getItem('users_name') : '')
    const [searchAddress, setSearchAddress] = useState(localStorage.getItem('userWalletAddress') !== undefined && localStorage.getItem('userWalletAddress') !== null? localStorage.getItem('userWalletAddress') : '')
    const [searchAtFrom, setSearchCreatedAtFrom] = useState(localStorage.getItem('userCreatedAtFrom') !== undefined && localStorage.getItem('userCreatedAtFrom') !== null? new Date(localStorage.getItem('userCreatedAtFrom')) : null)
    const [searchAtTo, setSearchCreatedAtTo] = useState(localStorage.getItem('userCreatedAtTo') !== undefined && localStorage.getItem('userCreatedAtTo') !== null? new Date(localStorage.getItem('userCreatedAtTo')) : null)
    const [minOfSearchAtTo , setMinOfSearchAtTo] = useState("")
    const [maxOfSearchAtTo , setMaxOfSearchAtTo] = useState("")

    const [minOfSearchAtFrom , setMinOfSearchAtFrom] = useState("")
    const [maxOfSearchAtFrom , setMaxOfSearchAtFrom] = useState("")
    const [isOpenCalenderFrom , setIsOpenCalenderFrom] = useState(false)
    const [isOpenCalenderAtTo , setIsOpenCalenderAtTo] = useState(false)

    useEffect(() => {
        const qs = ENV.objectToQueryString({ page : 1, limit: 10 })
        const filter = {}
        if(searchUsername !== undefined && searchUsername !== null && searchUsername !== '')
            filter.username = searchUsername
        if(searchAddress !== undefined && searchAddress !== null && searchAddress !== '')
            filter.address = searchAddress
        if(searchAtFrom !== undefined && searchAtFrom !== null && searchAtFrom !== '')
            filter.createdAtFrom = searchAtFrom
        if(searchAtTo !== undefined && searchAtTo !== null && searchAtTo !== '')
            filter.createdAtTo = searchAtTo

        window.scroll(0, 0)
        props.getUsers(qs,filter)
    }, [])


    useEffect(() => {
        if (props.user.getUserAuth) {
            const { users, pagination } = props.user
            setUsers(users)
            setPagination(pagination)
            props.beforeUser()
        }
    }, [props.user.getUserAuth])

    useEffect(()=>{
        if(props.user.upsertUserAuth){
            setLoader(true)
            
            let filtered = users.filter((item) => {
                if (item._id !== props.user.userId)
                    return item
            })
            
            setUsers([...filtered , props.user.user])
            setLoader(false)
            const filter = {}
            if(searchUsername){
                filter.username = searchUsername
                localStorage.setItem('users_name', searchUsername)
    
            }
            if(searchAddress){
                filter.address = searchAddress
                localStorage.setItem('userWalletAddress', searchAddress)
    
            }
            if(searchAtFrom){
                filter.createdAtFrom = searchAtFrom
                localStorage.setItem('userCreatedAtFrom', searchAtFrom)
    
            }
            if(searchAtTo){
                filter.createdAtTo = searchAtTo
                localStorage.setItem('userCreatedAtTo', searchAtTo)
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getUsers(qs , filter)
            props.beforeUser()
        }
    },[props.user.upsertUserAuth])

    useEffect(() => {
        if (props.user.deleteUserAuth) {
            // let filtered = users.filter((item) => {
            //     if (item._id !== props.user.userId)
            //         return item
            // })
            // setUsers(filtered)
            const filter = {}
            if(searchUsername){
                filter.username = searchUsername
                localStorage.setItem('users_name', searchUsername)
            }
            if(searchAddress){
                filter.address = searchAddress
                localStorage.setItem('userWalletAddress', searchAddress)
            }
            if(searchAtFrom){
                filter.createdAtFrom = searchAtFrom
                localStorage.setItem('userCreatedAtFrom', searchAtFrom)
            }
            if(searchAtTo){
                filter.createdAtTo = searchAtTo
                localStorage.setItem('userCreatedAtTo', searchAtTo)
            }
            
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            window.scroll(0, 0)
            props.getUsers(qs ,filter)
            props.beforeUser()
        }
    }, [props.user.deleteUserAuth])

    useEffect(() => {
        if (users) {
            setLoader(false)
            if (window.location.search) {
                const urlParams = new URLSearchParams(window.location.search);
                setModal(3, urlParams.get('userId'))
            }
        }
    }, [users])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const initalizeStates =()=>{
        setProfileImage('')
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setFacebookLink('')
        setTwitterLink('')
        setGplusLink('')
        setVineLink('')

        setProfileImageMsg('')
        setUsernameMsg('')
        setEmailMsg('')
        setPasswordMsg('')
        setConfirmPasswordMsg('')
        setFacebookLinkMsg('')
        setTwitterLinkMsg('')
        setGplusLinkMsg('')
        setVineLinkMsg('')
        setFormValid(false)
    }

    // set modal type
    const setModal = (type = 0, userId = null) => {
        initalizeStates()
        setUserModal(!userModal)
        setModalType(type)
        setLoader(false)
        // add user
        if (type === 1) {
            let user = {
                profileImage: '' ,username: '', email: '' ,password:'', facebookLink:'' , twitterLink:'' , gPlusLink:'' , vineLink:''
            }
            setUser(user)
        }
        // edit or view user
        else if ((type === 2 || type === 3) && userId)
            getUser(userId)
    }

    const getUser = async (userId) => {
        setLoader(true)
        const userData = await users.find((elem) => String(elem._id) === String(userId))
        if (userData){
            
            setUser({ ...userData })
            setProfileImage(userData.profileImage ? userData.profileImage :'')
            setUsername(userData.username ?  userData.username : '')
            setPassword('')
            setConfirmPassword('')
            setEmail(userData.email)
            setFacebookLink(userData.facebookLink ?  userData.facebookLink : '')
            setTwitterLink(userData.twitterLink ? userData.twitterLink : '' )
            setGplusLink(userData.gPlusLink ? userData.gPlusLink : '')
            setVineLink(userData.vineLink ? userData.vineLink : '')
        }
        setLoader(false)
    }

    const submit = (Id) => {
        
        let check = true 
        // 
        if ( validator.isEmpty(profileImage) ) {
            setProfileImageMsg('Profile Image is empty.')
            check = false
        }else setProfileImageMsg('')

        if (validator.isEmpty(username)) {
            setUsernameMsg('Username is required')
            check = false
        }else setUsernameMsg('')

        if (validator.isEmpty(email)) {
            setEmailMsg('Email is Required.')
            check = false
        }
        else{
            if(!validator.isEmail(email)){
                setEmailMsg('Please enter a valid email address.')    
                check = false
            }else{setEmailMsg('')}
        }

        if(validator.isEmpty(password)){
            if(modalType !==3){
                setPasswordMsg('Password is Required.')
                check = false
            }
        }
        else{
            setPasswordMsg('')
        }

        if(validator.isEmpty(confirmPassword) ){
            if(modalType !== 3 || !validator.isEmpty(password)){
                setConfirmPasswordMsg('Confirm password is Required.')
                check = false
            }
        }
        else {
            
            if(!validator.equals(password, confirmPassword)){

                setConfirmPasswordMsg('Passwords do not match')
                check = false
            }
            else{
                // setPasswordMsg('')
                setConfirmPasswordMsg('')
            }
        }

        

        if (check) {
            setFormValid(false)

            let payload = { profileImage , username , email ,password, facebookLink , twitterLink , gPlusLink , vineLink}

            // if (profileImage) {
            //     payload.profileImage = profileImage
            // } 

            if (modalType === 3) { // add modal type
                
                dispatch(editUser(Id, payload));
            }

            
            if (modalType === 1) { // add modal type
                
                dispatch(createUser(payload));
            }
            setUserModal(!userModal)
        }
        else{
            // $('#modal-primary').scrollTop(0, 0)
            setFormValid(true)
        }

    }
    const fileSelectHandler = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
          files = e.dataTransfer.files;
        } else if (e.target) {
          files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            // 
            setProfileImage(reader.result);
        };
        // setImageFile(files[0]);
        reader.readAsDataURL(files[0]);
      };
    const onPageChange = async (page) => {
        const filter = {}
        if(searchUsername){
            filter.username = searchUsername
            localStorage.setItem('users_name', searchUsername)

        }
        if(searchAddress){
            filter.address = searchAddress
            localStorage.setItem('userWalletAddress', searchAddress)

        }
        if(searchAtFrom){
            filter.createdAtFrom = searchAtFrom
            localStorage.setItem('userCreatedAtFrom', searchAtFrom)

        }
        if(searchAtTo){
            filter.createdAtTo = searchAtTo
            localStorage.setItem('userCreatedAtTo', searchAtTo)
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page:page , limit:10 })
        props.getUsers(qs,filter, true)
    }

    const deleteUser = (userId) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: 'If you delete an item, it would be permanently lost.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.value) {
                setLoader(true)
                props.deleteUser(userId)
            }
        })
    }

    const applyFilters = () =>{
        const filter = {}
        if(searchUsername){
            filter.username = searchUsername
            localStorage.setItem('users_name', searchUsername)

        }
        if(searchAddress){
            filter.address = searchAddress
            localStorage.setItem('userWalletAddress', searchAddress)

        }
        if(searchAtFrom){
            filter.createdAtFrom = new Date(searchAtFrom)
            localStorage.setItem('userCreatedAtFrom', searchAtFrom)
        }
        if(searchAtTo){
            filter.createdAtTo = new Date(searchAtTo) //
            localStorage.setItem('userCreatedAtTo', searchAtTo)
        }

        const qs = ENV.objectToQueryString({ page : 1, limit: 10 })
        
        props.getUsers(qs, filter)
        setLoader(true)
    }

    const reset = () =>{
        setSearchCreatedAtFrom('')
        setSearchCreatedAtTo('')
        setSearchAddress('')
        setSearchName('')
        setMinOfSearchAtFrom("")
        setMaxOfSearchAtFrom("")
        setMinOfSearchAtTo("")
        setMaxOfSearchAtTo("")
        setPage(1)
        const qs = ENV.objectToQueryString({page:1 , limit:10})
        props.getUsers(qs)
        setLoader(true)
        localStorage.removeItem('users_name')
        localStorage.removeItem('userWalletAddress')
        localStorage.removeItem('userCreatedAtFrom')
        localStorage.removeItem('userCreatedAtTo')
        localStorage.removeItem('showUsersFilter')
    }

    useEffect(()=>{
        if(searchAtFrom){
            
            setIsOpenCalenderFrom(false)
        }
    },[searchAtFrom])
    const handleDate = (e ,state, num='') => {
        // alert('in DateHandler')
        // 
        // 
        
        
        if(e){
            // alert(e)
            // setIsOpenCalenderFrom(true)
            if(num  === 1){ // From
                
                    // alert("Empty searchTo")
                    //minimum prop of searchAtTo
                    setMinOfSearchAtFrom("")
                    setMaxOfSearchAtFrom("")
                    setMinOfSearchAtTo(e)
                    setMaxOfSearchAtTo("")
                    setIsOpenCalenderFrom(false)
                    
            }
            if(num  === 2){ //To

                    // alert("Empty searchFrom")
                    //minimum prop of searchAtTo
                    setMinOfSearchAtFrom("")
                    setMaxOfSearchAtFrom("")
                    setMinOfSearchAtTo("")
                    setMaxOfSearchAtTo("")
                    setIsOpenCalenderAtTo(false)
            }
            state(e)
        }
        else{
            state('')
            setMinOfSearchAtTo('')
            setIsOpenCalenderFrom(false)
        }
        
        
    }
    return(
        <>
        {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row className="pb-3">
                            <Col sm={12}>
                                <Card className="filter-card">
                                    <Card.Header>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                            {/* <p className="card-collection">List of Auctions</p> */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{color : 'white'}}>Name</label>
                                                    <Form.Control value = {searchUsername} type="text" placeholder="John" onChange={(e) => setSearchName(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <label style={{color : 'white'}}>Wallet Address</label>
                                                <Form.Control value = {searchAddress} type="text" placeholder="Walet Address" onChange={(e) => setSearchAddress(e.target.value)}/* onChange={} onKeyDown={} */ />
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{color : 'white'}}>Created At From</label>
                                                    <DatePicker onChange={(e)=>{ handleDate(e , setSearchCreatedAtFrom , 1) } } closeCalendar={isOpenCalenderFrom} value={ searchAtFrom  ? searchAtFrom : null } maxDate ={searchAtTo ? new Date(searchAtTo) :  new Date()} minDate ={minOfSearchAtTo ? new Date(minOfSearchAtTo) : new Date("1800-01-01")}/>
                                                    {/* <Form.Control value = {searchAtFrom} type="date" placeholder="mm/dd/yyyy" min={minOfSearchAtFrom ? minOfSearchAtFrom : ""} max={maxOfSearchAtFrom ? moment().format(maxOfSearchAtFrom , "YYYY-MM-DD") : moment().format("YYYY-MM-DD")} onChange={(e) =>{ setSearchCreatedAtFrom(e.target.value) }}/* onChange={} onKeyDown={}  */}
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{color : 'white'}}>Created At To</label>
                                                    <DatePicker onChange={(e)=>{ handleDate(e , setSearchCreatedAtTo , 2) } } closeCalendar={isOpenCalenderAtTo} value={ searchAtTo  ? searchAtTo : null  } maxDate ={new Date()} minDate={searchAtFrom ? new Date(searchAtFrom) : new Date("1800-01-01")} />
                                                    {/* <Form.Control value = {searchAtTo} type="date" placeholder="mm/dd/yyyy" min={minOfSearchAtTo ? minOfSearchAtTo : ""} max={ maxOfSearchAtTo ? moment().format(maxOfSearchAtTo , "YYYY-MM-DD") : moment().format("YYYY-MM-DD")} onChange={(e) =>{ setSearchCreatedAtTo(e.target.value)}}/* onChange={} onKeyDown={}  */}
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="d-block mb-2">&nbsp;</Form.Label>
                                                    <div className="d-flex justify-content-between filter-btns-holder">
                                                        <Button variant="info" onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {/* <Row>
                            <Col>
                                <span style={{color : 'white'}}>{`Total : ${pagination?.total}`}</span>
                                <label>&nbsp;</label>
                            </Col>
                        </Row> */}
                        <Row>
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                    <div className='d-flex justify-content-end mb-2 pr-3'>
                                    <span  style={{ color: 'white',fontWeight:'bold' }}>{`Total : ${pagination?.total}`}</span>
                                    </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Users</Card.Title>
                                            {
                                                // permissions && permissions.addContent && 
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setModal(1)}
                                                    >
                                                    Add User
                                                </Button>
                                            }
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th>Image</th>
                                                        <th>Username</th>
                                                        <th>Email</th>
                                                        <th>Address</th>
                                                        <th >Created At</th>
                                                        <th className="td-actions">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        users && users.length ?
                                                            users.map((user, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                        <td>
                                                                            <div className="user-image">
                                                                                {/* {} */}
                                                                                <img className="img-fluid" alt="User Image" src={user.profileImage ? user.profileImage : userDefaultImg} onError={(e)=> {e.target.onerror = null ; e.target.src = userDefaultImg}  } />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            {user.username}
                                                                        </td>
                                                                        <td>
                                                                            {user.email}
                                                                        </td>
                                                                        <td>
                                                                            {user.address}
                                                                        </td>
                                                                        <td className="td-number">{moment(user.createdAt).format('DD MMM YYYY')}</td>
                                                                        
                                                                            <td className="td-actions">
                                                                            <ul className="list-unstyled mb-0 d-flex">
                                                                                <li className="d-inline-block align-top">
                                                                                        <a
                                                                                            className="btn-action btn-primary"
                                                                                            type="button" title="View"
                                                                                            variant="info"
                                                                                            onClick={() => setModal(2, user._id)}
                                                                                        >
                                                                                            <i className="fas fa-eye"></i>
                                                                                        </a>
                                                                                </li>
                                                                                <li className="d-inline-block align-top">
                                                                                        <a
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="info"
                                                                                            onClick={() => setModal(3, user._id)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </a>
                                                                                    {/* li is not a child of li here */}
                                                                                    <div className="d-inline-block align-top">
                                                                                            <a
                                                                                                className="btn-action btn-danger"
                                                                                                type="button" title="Delete"
                                                                                                variant="info"
                                                                                                onClick={() => deleteUser(user._id)}
                                                                                            >
                                                                                                <i className="fas fa-trash"></i>
                                                                                            </a>
                                                                                    </div>
                                                                                </li>
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="6" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No User Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <div className="pb-4">
                                                {pagination &&
                                                    <Pagination
                                                        className="m-3"
                                                        defaultCurrent={1}
                                                        pageSize // items per page
                                                        current={Page > pagination.pages ? pagination.pages : Page} // current active page
                                                        total={pagination.pages} // total pages
                                                        onChange={onPageChange}
                                                        locale={localeInfo}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>


                        {
                            modalType === 2 && user &&
                            <Modal className="modal-primary" onHide={() => setUserModal(!userModal)} show={userModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {/* {modalType === 1 ? 'Add' : modalType === 2 ? 'Edit' : ''} User */}
                                                View 
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <Form.Group>
                                            <label className="label-font mr-2">Profile Image: </label>
                                            <div>
                                                <div className="user-view-image">
                                                    <img src={user.profileImage ? user.profileImage : userDefaultImg} onError={(e)=> {e.target.onerror = null ; e.target.src = userDefaultImg}  } />
                                                </div>
                                            </div>
                                        </Form.Group>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Username: </label><span className="field-value">{user.username ?  user.username : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        {/* <div className="d-flex name-email">
                                            <Form.Group className="flex-fill">
                                                <label className="label-font mr-2">Email: </label><span className="field-value">{user.email}</span>
                                            </Form.Group>
                                        </div> */}
                                        <div className="d-flex name-email">
                                            <Form.Group className='d-flex align-items-center'>
                                                <label className="label-font mr-2">Description:</label><span className="field-value"> {user.description ? user.description : 'N/A'}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className='d-flex align-items-center'>
                                                <label className="label-font mr-2">Facebook: </label><span className="field-value">{user.facebookLink ? user.facebookLink : 'N/A'}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className='d-flex align-items-center'>
                                                <label className="label-font mr-2">Twitter: </label><span className="field-value">{user.twitterLink ? user.twitterLink : 'N/A'}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className='d-flex align-items-center'>
                                                <label className="label-font mr-2">G Plus: </label><span className="field-value">{user.gPlusLink ? user.gPlusLink : 'N/A'}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className='d-flex align-items-center'>
                                                <label className="label-font mr-2">Vine: </label><span className="field-value">{user.vineLink ? user.vineLink : 'N/A'}</span>
                                            </Form.Group>
                                        </div>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-info" onClick={() => setUserModal(!userModal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                        {/*  */}
                        {
                           ( modalType === 1 || modalType === 3 )  && user &&

                            <Modal className="modal-primary" onHide={() => setUserModal(!userModal)} show={userModal}>
                                {/* {
                                    formValid ?
                                        <div className="text-danger">Please fill the required fields</div> : null
                                } */}
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {modalType === 1 ? 'Add ' : modalType === 3 ? 'Edit ' : ''} 
                                                User Information
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <Form.Group>
                                            <label>Profile Image<span className="text-danger"> *</span></label>
                                                <div className='mb-2'>
                                                    { <img src={profileImage ? profileImage : userDefaultImg} onError={(e)=> {e.target.onerror = null ; e.target.src = userDefaultImg}  } style={{width:'200px'}} />} 
                                                </div>
                                                <Form.Control 
                                                    className='text-white'
                                                    onChange={async (e) => {
                                                        fileSelectHandler(e);
                                                        const res=await ENV.uploadImage(e);
                                                        setProfileImage(res ? ENV.uploadedImgPath+res  : "")
                                                        // setDetail({ ...detail, image: res ? ENV.uploadedImgPath+res  : "" });
                                                    }}
                                                    // placeholder="Title"
                                                    type="file"
                                                ></Form.Control>
                                                <span className={profileImageMsg ? `` : `d-none`}>
                                                {(profileImage === '' || profileImage === null ) && <label className="pl-1 text-danger">{profileImageMsg}</label>}
                                                </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Username <span className="text-danger">*</span></label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="username"
                                                onChange={(e) => setUsername(e.target.value)}
                                                value={username}
                                                required
                                            />
                                            <span className={usernameMsg ? `` : `d-none`}>
                                                {(username === '' || username === null ) && <label className="pl-1 text-danger">{usernameMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Email <span className="text-danger">*</span></label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="email"
                                                onChange={(e) => setEmail(e.target.value)}
                                                value={email}
                                                required
                                            />
                                            <span className={emailMsg? `` : `d-none`}>
                                                {(email === ''  || email === null )&& <label className="pl-1 text-danger">{emailMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>password <span className="text-danger">*</span></label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="password"
                                                name="description"
                                                onChange={(e) => setPassword(e.target.value)}
                                                value={ password }
                                                required
                                            />
                                            <span className={passwordMsg  ? `` : `d-none`}>
                                            {(password === ''  || password === null ) && <label className="pl-1 text-danger">{passwordMsg}</label>}
                                            </span>
                                        </Form.Group> 
                                        <Form.Group>
                                            <label>Confirm password <span className="text-danger">*</span></label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="password"
                                                name="description"
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                value={ confirmPassword }
                                                required
                                            />
                                            <span className={confirmPasswordMsg  ? `` : `d-none`}>
                                            {(confirmPassword === ''  || confirmPassword === null ) && <label className="pl-1 text-danger">{confirmPasswordMsg}</label>}
                                            </span>
                                        </Form.Group> 
                                        <Form.Group>
                                            <label>Facebook </label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="facebookLink"
                                                onChange={(e) => setFacebookLink(e.target.value)}
                                                value={ facebookLink}
                                                
                                            />
                                            <span className={ facebookLinkMsg ? `` : `d-none`}>
                                                {(facebookLink === ''  || facebookLink === null ) && <label className="pl-1 text-danger">{facebookLinkMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Twitter </label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="twitterLink"
                                                onChange={(e) => setTwitterLink(e.target.value)}
                                                value={twitterLink}
                                                
                                            />
                                            <span className={twitterLinkMsg ? `` : `d-none`}>
                                            {(twitterLink === ''  || twitterLink === null ) &&<label className="pl-1 text-danger">{twitterLinkMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>G Plus</label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="gPlusLink"
                                                onChange={(e) => setGplusLink(e.target.value)}
                                                value={gPlusLink ? gPlusLink : ''}
                                                
                                            />
                                            <span className={gPlusLinkMsg ? `` : `d-none`}>
                                                {(gPlusLink === ''  || gPlusLink === null ) && <label className="pl-1 text-danger">{gPlusLinkMsg}</label>}
                                            </span>
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Vine</label>
                                            <Form.Control
                                                // placeholder="Enter Game Name"
                                                disabled={props.modalType === 2}
                                                type="text"
                                                name="vineLink"
                                                onChange={(e) => setVineLink(e.target.value)}
                                                value={vineLink ? vineLink : ''}
                                                
                                            />
                                            <span className={vineLinkMsg  ? `` : `d-none`}>
                                                {(vineLink === ''  || vineLink === null ) &&  <label className="pl-1 text-danger">{vineLinkMsg}</label>}
                                            </span>
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-danger"
                                        onClick={() => setUserModal(!userModal)}
                                    >Close</Button>
                                    {
                                        modalType === 3 ? '' :
                                            <Button className="btn btn-info" onClick={() => submit(user._id)} /* disabled={isLoader} */>Save</Button>
                                    }
                                      {
                                        modalType === 1 ? '' :
                                            <Button className="btn btn-info" onClick={() => submit(user._id)} /* disabled={isLoader} */>Update</Button>
                                    }
                                    
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}
export default PlayerUser