import * as React from "react";

export default class Home extends React.Component {
  render() {
    return (
      <>
        <header className="p-3 bg-dark text-white">
          <div className="container">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
              <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
                Radar
              </a>

              <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                
              </ul>


              <div className="text-end">
                <a href="/login" type="button" className="btn btn-outline-light me-2">Login</a>
                <a href="/signup" type="button" className="btn btn-warning">Sign-up</a>
              </div>
            </div>
          </div>
        </header>
        <div className="px-4 py-5 my-5 text-center">
          <h1 className="display-5 fw-bold">Radar</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">Monitoring broadband accessibility</p>
          </div>
        </div>
      </>
    )
  }
}