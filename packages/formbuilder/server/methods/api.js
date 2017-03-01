Meteor.methods({
  'DynamicForms.insert': function(sel,data) {
    console.log(sel, {form: data});
    DynamicForms.upsert(sel,{$set: {form: data}});
  }
});

Meteor.methods({
  'DynamicForms.remove': function(name) {
    console.log("DynamicForms.remove",name);
    check(name,String);
    DynamicForms.remove({name:name});
  }
});
