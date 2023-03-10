import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { MeteorProfile } from '../../../../both/init'
import { ProfilePicture } from '../../common/ProfilePicture.jsx'

// TODO Clean up this mess

const removeFile = fileId => () => {
  const conf = window.confirm('Are you sure you want to delete the file?')
  if (conf === true) {
    MeteorProfile.ProfilePictures.remove({ _id: fileId })
  }
}
const IndividualFile = ({ fileName, fileUrl, fileId }) => (
  <div className="m-t-sm">
    <div className="row">
      <div className="col-md-8">
        <strong>{fileName}</strong>
      </div>
    </div>

    <div className="col-md-3">
      <ProfilePicture srcOverride={fileUrl} alt="profile" />
    </div>

    <div className="col-md-4">
      <button type="button" onClick={removeFile(fileId)} className="btn btn-outline btn-danger btn-sm">
        Delete
      </button>
    </div>
  </div>
)

class FileUploadComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      progress: 0,
      inProgress: false,
    }
  }

  uploadIt = (e) => {
    e.preventDefault()

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const { onPicUploaded } = this.props
      // We upload only one file, in case
      // there was multiple files selected
      const file = e.currentTarget.files[0]

      if (file) {
        MeteorProfile.ProfilePictures.remove({ userId: Meteor.userId() })
        const uploadInstance = MeteorProfile.ProfilePictures.insert({
          file,
          meta: {
            createdAt: new Date(),
          },
          streams: 'dynamic',
          chunkSize: 'dynamic',
          allowWebWorkers: true, // If you see issues with uploads, change this to false
        }, false)

        this.setState({
          inProgress: true, // Show the progress bar now
        })

        uploadInstance.on('uploaded', (error, fileObj) => {
          onPicUploaded(fileObj._id)

          // Reset our state for the next file
          this.setState({
            progress: 0,
            inProgress: false,
          })
        })

        uploadInstance.on('progress', (progress) => {
          // Update our progress bar
          this.setState({
            progress,
          })
        })

        uploadInstance.start() // Must manually start the upload
      }
    }
  }

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed
  showUploads() {
    const { inProgress, progress } = this.state
    return inProgress && (
      <div>
        Uploading

        <div className="progress progress-bar-default">
          <div
            style={{ width: `${progress}%` }}
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={progress || 0}
            role="progressbar"
            className="progress-bar"
          >
            <span className="sr-only">{progress}% Complete (success)</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { label, files, docsReadyYet } = this.props
    const { inProgress } = this.state
    if (files && docsReadyYet) {
      const [file] = files

      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <p>{label}</p>
              <input
                type="file"
                id="fileinput"
                disabled={inProgress}
                onChange={this.uploadIt}
              />
            </div>
          </div>

          <div className="row m-t-sm m-b-sm">
            <div className="col-md-6">

              {this.showUploads()}

            </div>
            <div className="col-md-6" />
          </div>

          <div>
            {file && (
              <IndividualFile
                fileName={file.name}
                // This should NOT be in a render...
                fileUrl={MeteorProfile.ProfilePictures.findOne({ _id: file._id }).link()}
                fileId={file._id}
                fileSize={file.size}
              />
            )}
          </div>

        </div>
      )
    }
    return <div>Loading file list</div>
  }
}

export const ImageUpload = withTracker(({ label, onPicUploaded }) => {
  const filesHandle = Meteor.subscribe('meteor-user-profiles.ProfilePictures')
  const docsReadyYet = filesHandle.ready()
  const userId = Meteor.userId()
  const files = MeteorProfile.ProfilePictures.find({ userId }).fetch()

  return {
    label,
    docsReadyYet,
    files,
    onPicUploaded,
  }
})(FileUploadComponent)
