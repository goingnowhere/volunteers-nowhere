
ReactiveForms.createFormBlock({
  template: 'basicFormBuilderBlock',
  submitType: 'normal'
});

ReactiveForms.createElement({
  template: 'basicFormBuilderSelect',
  validationEvent: 'keyup',
  reset: function (el) {
    $(el).val('');
  }
});

ReactiveForms.createElement({
  template: 'basicFormBuilderTextarea',
  validationEvent: 'keyup',
  reset: function (el) {
    $(el).val('');
  }
});

ReactiveForms.createElement({
  template: 'basicFormBuilderInput',
  validationEvent: 'keyup',
  reset: function (el) {
    $(el).val('');
  }
});

ReactiveForms.createElement({
  template: 'basicFormBuilderInputGroup',
  validationEvent: 'keyup',
  reset: function (el) {
    $(el).val('');
  }
});

SSTypes = [ "String", "Number", "Boolean", "Object", "Date" ];

Template.basicFormBuilderInputGroup.helpers({
  checked: function(t) { if (t) { return "checked";}},
  realType: function(t) {
    switch (t) {
      case "radio-group": return "radio";
      case "checkbox-group": return "checkbox";
    }
  },
});

Template.basicFormBuilderSelect.helpers({
  selected: function(t) { if (t) { return "selected";}},
});

Template.basicFormBuilderInput.helpers({
  checked: function(t) { if (t) { return "checked";}},
});

Template.formBuilderRender.onCreated(function (){
  this.subscription = this.subscribe('FormBuilder.dynamicForms');
});

Template.formBuilderRender.helpers({
  equal: function (a,b) { return (a == b);},
  schema: function () {
    console.log("AAAAAAAAAAAAAA");
    console.log(Template.currentData());
    var name = Template.currentData().name;
    var data = DynamicForms.findOne({name:name});
    if (data) {
      return toSimpleSchema(data);
    }
  },
  fields: function() {
    var name = Template.parentData().name;
    console.log(name);
    var data = DynamicForms.findOne({name:name});
    if (data) {
      return _.map(data.form, function(x){
        console.log(_.extend(x,{field: x.name }));
        return _.extend(x,{field: x.name });
      });
    }
  },
  action: function () {
    return function (els, callbacks, changed) {
      console.log("[forms] Action running!");
      console.log("[forms] Form data!", this);
      console.log("[forms] HTML elements with `.reactive-element` class!", els);
      console.log("[forms] Callbacks!", callbacks);
      console.log("[forms] Changed fields!", changed);

      callbacks.success(); // Display success message.
      callbacks.reset();   // Run each Element's custom `reset` function to clear the form.
    };
  }
});
