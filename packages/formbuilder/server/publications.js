Meteor.publish("FormBuilder.dynamicForms", function () {
  return DynamicForms.find();
});
