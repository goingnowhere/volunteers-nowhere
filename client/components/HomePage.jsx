import { Loading } from 'meteor/goingnowhere:volunteers'
import React, {
  useMemo,
  useState,
  useEffect,
} from 'react'
import Fa from 'react-fontawesome'
import { Link } from 'react-router-dom'
import moment from 'moment-timezone'

export function HomePage({ user, settings, isLoaded }) {
  const openMoment = useMemo(() =>
    (isLoaded ? moment(settings.fistOpenDate) : null),
  [isLoaded, settings.fistOpenDate])

  const [seconds, setSeconds] = useState()
  useEffect(() => {
    let interval
    if (isLoaded) {
      const secondsNow = openMoment.diff(moment(), 'seconds')
      setSeconds(secondsNow)
      if (secondsNow > 0) {
        interval = setInterval(() => {
          setSeconds(openMoment.diff(moment(), 'seconds'))
        }, 1000)
      }
    }
    return () => interval && clearInterval(interval)
  }, [isLoaded, openMoment])

  return (
    <>
      <header id="page-top" className="masthead bg-primary text-white text-center">
        <div className="container">
          <h1 className="home-title">Co-Create Nowhere 2024</h1>
          <div className="row justify-content-center">
            <div className="col-lg-6">
              {!isLoaded ? (
                <Loading />
              ) : seconds > 0
                ? (
                  <>
                    <p className="lead">
                      You can register for on-site roles from {openMoment.format('Do MMMM')}:
                    </p>
                    <div className="row">
                      <button type="button" className="col btn btn-secondary m-1" disabled>
                        {seconds} seconds
                      </button>
                      <a className="col btn btn-secondary m-1" href="https://www.goingnowhere.org/get-involved/volunteering/">
                        I can&apos;t wait, I want to volunteer now!
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="lead">
                      For Information and Scheduling of Teams
                    </p>
                    <div className="row">
                      <Link
                        to={user ? '/dashboard/' : '/signup'}
                        className="col btn btn-secondary m-1"
                      >
                        {user ? 'Get to it' : 'Register now'}
                      </Link>
                      <a className="col btn btn-secondary m-1" href="https://www.goingnowhere.org/get-involved/volunteering/">
                        I want to help before getting to site!
                      </a>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </header>

      <section className="home bg-secondary mb-0" id="about">
        <div className="container">
          <h2 className="text-center text-uppercase">About</h2>
          {user ? (
            <div className="row">
              <div className="col-lg-4 ml-auto">
                <p className="lead">
                  You&apos;ve been here before so we&apos;re not going to
                  bore you with the usual speech about what Nowhere is.
                  You can just sit here and enjoy the fun countdown.
                </p>
              </div>
              <div className="col-lg-4 mr-auto">
                <p className="lead">
                  If you get restless though, there&apos;s plenty to
                  get stuck into right now, so why wait? Head on over
                  to <a href="https://www.goingnowhere.org/get-involved/volunteering/">the website</a> to
                  find out what Nowhere needs most.
                </p>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-4 ml-auto">
                <p className="lead">
                  Nowhere is an experiment in creative freedom,
                  participation and cash-free community. Conceived,
                  built, experienced and returned to nothing by YOU.
                </p>
              </div>
              <div className="col-lg-4 mr-auto">
                <p className="lead">
                  It&lsquo;s people like YOU who set up the site, keep
                  things running smoothly during the event, and pack up
                  everything back to dust, so you&lsquo;ve come to the right place
                </p>
              </div>
            </div>
          )}
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
              <p className="lead mb-0">
                Made with love <a href="https://github.com/goingnowhere/volunteers-nowhere">See the Code</a>.
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
          <Fa name="chevron-up" />
        </a>
      </div>
    </>
  )
}
