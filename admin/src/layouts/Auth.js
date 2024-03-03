import React, { useEffect , useState} from "react";
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
const Unauth = (props)=> {

  const [loader, setLoader] = useState(false)
  let accessToken = localStorage.getItem("accessToken")
  useEffect(() => {
    if (accessToken && window.location.pathname != "/admin/permission-denied") {
      setLoader(true)
      window.location.href = '/admin/dashboard';
    }
  },[])

    return (
      <div className="wrapper login-wrapper">
        {
          loader? <FullPageLoader/> : props.children
        }
        
      </div>
    );
}

export default Unauth;
