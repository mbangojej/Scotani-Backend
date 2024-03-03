import React, { Component } from 'react';
import routes from './routes';
import { PrivateRoute } from './privateRoute';
import { Route, Switch } from "react-router-dom";
import NotFound from "views/NotFound/NotFound";
import { ENV } from './config/config';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loggedIn: true, // Set to true when the user is logged in
      timeout: 900000, // 15 minutes in milliseconds (15 * 60 * 1000)
    };

    // Initialize an idle timer
    this.idleTimer = null;

    // Bind event listeners to reset the timer
    this.resetTimer = this.resetTimer.bind(this);
    // this.logout = this.logout.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  componentDidMount() {
    // Set up event listeners for user activity
    this.startIdleTimer();
    window.addEventListener('mousemove', this.resetTimer);
    window.addEventListener('click', this.resetTimer);
    window.addEventListener('mousedown', this.resetTimer);
    window.addEventListener('mouseup', this.resetTimer);
    window.addEventListener('mouseenter', this.resetTimer);
    window.addEventListener('mouseleave', this.resetTimer);
    window.addEventListener('wheel', this.resetTimer);
    window.addEventListener('keydown', this.resetTimer);
    // Add event listener for tab/window close and page refresh
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  componentWillUnmount() {
    // Clean up event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('mousemove', this.resetTimer);
    window.removeEventListener('click', this.resetTimer);
    window.removeEventListener('mousedown', this.resetTimer);
    window.removeEventListener('mouseup', this.resetTimer);
    window.removeEventListener('mouseenter', this.resetTimer);
    window.removeEventListener('mouseleave', this.resetTimer);
    window.removeEventListener('wheel', this.resetTimer);
    window.removeEventListener('keydown', this.resetTimer);
    this.clearIdleTimer();
  }
  startIdleTimer() {
    // Start the idle timer
    // this.idleTimer = setTimeout(this.logout, this.state.timeout);
  }
  clearIdleTimer() {
    // Clear the idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
  }
  resetTimer() {
    // Reset the idle timer on user activity
    this.clearIdleTimer();
    this.startIdleTimer();
  }
  handleVisibilityChange() {
    if (document.hidden) {
      // The tab is not active (e.g., tab changed)
      const sessionStartTime = parseInt(localStorage.getItem('sessionStartTime'), 10);

      const currentTime = Date.now();
      const elapsedTime = currentTime - sessionStartTime;

      if (elapsedTime >= 900000) {
        // Logout the user if the elapsed time is greater than or equal to 15 minutes
        // Perform logout action when the timer expires, the tab is closed, or the page is refreshed
        this.setState({ loggedIn: false });
        // this.logout()
      }
    } else {
      // The tab is active again, update the session start time
      localStorage.setItem('sessionStartTime', Date.now());
    }
  }



  logout() {
    // Perform logout action when the timer expires, the tab is closed, or the page is refreshed
    // this.setState({ loggedIn: false });
    // localStorage.setItem('isLoggedIn', 'false');
    // // You can add code here to log the user out or redirect them to the login page.
    // localStorage.removeItem("accessToken");
    // window.location.replace('/admin');
  }


  render() {
    return (
      <React.Fragment>
        <Switch>
          {
            routes.map((route, index) => {
              if (route.path) {
                return (
                  <PrivateRoute
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    access={true}
                    component={props => (
                      <route.layout {...props}>
                        <route.component {...props} />
                      </route.layout>
                    )}
                  />
                )
              }
              else {
                return (
                  route.submenus.map((subroute, subkey) => {
                    if (subroute.path) {
                      return (
                        <PrivateRoute
                          key={index + subkey}
                          path={subroute.path}
                          exact={subroute.exact}
                          access={true}
                          component={props => (
                            <subroute.layout {...props}>
                              <subroute.component {...props} />
                            </subroute.layout>
                          )}
                        />
                      )
                    }
                    else {
                      return (
                        subroute.submenus.map((nestedsubroute, nestedsubkey) => {
                          return (
                            <PrivateRoute
                              key={index + nestedsubkey}
                              path={nestedsubroute.path}
                              exact={nestedsubroute.exact}
                              access={true}
                              component={props => (
                                <nestedsubroute.layout {...props}>
                                  <nestedsubroute.component {...props} />
                                </nestedsubroute.layout>
                              )}
                            />
                          )
                        })
                      )
                    }
                  })
                )
              }
            })
          }
          <Route component={NotFound} />
        </Switch>
      </React.Fragment>
    )
  }
}
export default App;