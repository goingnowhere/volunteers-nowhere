import React, { Fragment } from 'react'

export const HomePage = () => (
  <Fragment>
    <header id="page-top" className="masthead bg-primary text-white text-center">
      <div className="container">
        <h1 className="home-title">Co-Create Nowhere 2019</h1>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <p className="lead">
              Nowhere is a collective experiment conceived,
              built, experienced and returned to nothing by
              a lot of nobodies just like YOU.<br />
              So we need YOU to help set up the site, keep
              things running smoothly during the event, and
              pack up everything back to dust.
            </p>
          </div>
        </div>
      </div>
    </header>

    {/* <a href="{{pathFor 'atSignIn'}}" className="btn btn-lg btn-outline">
        Sign-Up
    </a>
    <a href="{{pathFor 'atSignIn'}}" className="btn btn-lg btn-outline">
        Log-in
    </a> */}

    <section className="home bg-secondary mb-0" id="about">
      <div className="container">
        <h2 className="text-center text-uppercase">About</h2>
        <div className="row">
          <div className="col-lg-4 ml-auto">
            <p className="lead">
              Nowhere is an experiment in creative freedom, participation and
              cash-free community, conceived, built, experienced and returned
              to nothing by YOU
            </p>
          </div>
          <div className="col-lg-4 mr-auto">
            <p className="lead">
              We need lots of hands in a variety of roles to set up the site,
              keep things running smoothly during the event, and then pack up
              when the event is over.
            </p>
          </div>
        </div>
      </div>
    </section>

    <footer className="footer text-center">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-5 mb-lg-0">
            <h4 className="text-uppercase mb-4">Location</h4>
            <p className="lead mb-0">Middle of Spain
              <br />Middle of Nowhere
            </p>
          </div>
          <div className="col-md-4">
            <h4 className="text-uppercase mb-4">About this website</h4>
            <p className="lead mb-0">Made with love
              <a href="https://github.com/goingnowhere/volunteers-nowhere">See the Code</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>

    <div className="copyright py-4 text-center text-white">
      <div className="container">
        <small>Licence AGPL3</small>
      </div>
    </div>

    {/* Scroll to Top Button (Only visible on small and extra-small screen sizes) */}
    <div className="scroll-to-top d-lg-none position-fixed ">
      <a className="js-scroll-trigger d-block text-center text-white rounded" href="#page-top">
        <i className="fa fa-chevron-up" />
      </a>
    </div>
  </Fragment>
)
