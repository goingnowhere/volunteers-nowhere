Router.route({
  '/admin/forms': {
     name: 'formBuilder',
     template: 'adminFormBuilder',
     waitOn: (function(){return [ Meteor.subscribe("FormBuilder.dynamicForms")];})
   },
  '/admin/forms/:_id': {
    name: 'formBuilderEdit',
    template: 'adminFormBuilder',
    waitOn: (function(){ return [ Meteor.subscribe("FormBuilder.dynamicForms")];}),
    data: (function() {
      if (this.params && this.params._id && this.ready()){
        return FormBuilder.Collections.DynamicForms.findOne(this.params._id);
      }
    })
  }
 });
