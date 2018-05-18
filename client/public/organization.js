import { Template } from 'meteor/templating'
import 'orgchart'
import 'orgchart/src/css/jquery.orgchart.css'
import { Volunteers } from '../../both/init'

const listToTree = function listToTree(list) {
  const map = {}
  const roots = []
  list.map((node) => {
    const workingNode = {
      ...node,
      children: [],
    }
    map[node._id] = workingNode
    return workingNode
  }).forEach((node) => {
    if (node.parentId === 'TopEntity') {
      roots.push(node)
    } else {
      map[node.parentId].children.push(node)
    }
  })
  return roots
}

Template.organization.onCreated(function onCreated() {
  const template = this
  template.sub = Meteor.subscribe('nowhere2018.Volunteers.organization')
})

Template.organization.onRendered(function onRendered() {
  const template = this
  return template.autorun(() => {
    if (template.sub.ready()) {
      const teams = Volunteers.Collections.Team.find().fetch()
      const departments = Volunteers.Collections.Department.find().fetch()
      const divisions = Volunteers.Collections.Division.find().fetch()
      const datasource = {
        name: 'Nowhere',
        children: listToTree(divisions.concat(departments).concat(teams)),
      }
      const options = {
        data: datasource,
        depth: 4,
        // the content can be a link, the leads, a popup, etc ...
        // nodeContent: 'title',
      }
      template.$('#chartContainerId').orgchart(options)
    }
  })
})
