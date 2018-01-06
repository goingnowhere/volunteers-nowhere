import OrgChart from 'orgchart'
import 'orgchart/src/css/jquery.orgchart.css'
import { Volunteers } from '/both/init'

list_to_tree = (list) ->
  map = {}
  node = undefined
  roots = []
  i = undefined
  i = 0
  while i < list.length
    map[list[i]._id] = i
    list[i].children = []
    i += 1
  i = 0
  while i < list.length
    node = list[i]
    if node.parentId != 'TopEntity'
      list[map[node.parentId]].children.push node
    else
      roots.push node

    delete node.parentId
    i += 1
  roots

Template.organization.onCreated () ->
  template = this
  template.sub = Meteor.subscribe("nowhere2018.Volunteers.organization")

Template.organization.onRendered () ->
  template = this
  template.autorun () ->
    if template.sub.ready()
      teams = Volunteers.Collections.Team.find().fetch()
      departments = Volunteers.Collections.Department.find().fetch()
      divisions = Volunteers.Collections.Division.find().fetch()
      datascource =
        name: "Nowhere"
        children: list_to_tree(divisions.concat(departments).concat(teams))
      options =
        data: datascource
        depth: 4
        # the content can be a link, the leads, a popup, etc ...
        # nodeContent: 'title'
      oc = template.$('#chartContainerId').orgchart(options)
