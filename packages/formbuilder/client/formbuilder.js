
import 'formBuilder/dist/form-builder.css';
import 'jquery-ui-sortable';
import 'formBuilder';

Template.registerHelper("debug", function (optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

SSTypes = [ "String", "Number", "Boolean", "Object", "Date" ];

Template.formBuilder.onCreated(function () {
  var template = this;
  template.subscription = template.subscribe('FormBuilder.dynamicForms');
  template.options = {
    showActionButtons: false,
    dataType: 'json',
    disableFields: ['autocomplete', 'button', 'header', 'hidden', 'paragraph','file'],
    controlOrder: ['text', 'textarea', 'number', 'checkbox', 'checkbox-group', 'radio-group', 'select', 'date'],
    typeUserAttrs: {
      number: {
        isArray: {
          label: "Array of Values",
          type: "checkbox"
        },
        jsType: {
          label: "Simple-schema type",
          options: SSTypes
        }
      }
    }
  };
});

Template.formBuilder.onRendered(function () {
  var template = this;
  var formWrap = $(".build-wrap");
  // template.formBuilder = formWrap.formBuilder(template.options).data('formBuilder');
  template.autorun(function(){
    if (template.subscription.ready()) {
      console.log("AAAAA",Template.currentData().name);
      var name = Template.currentData().name;
      var form = DynamicForms.findOne({name:name});
      if (form) {
        template.options.formData = JSON.stringify(form.form);
      }
      if (! template.formBuilder ) {
          template.formBuilder = formWrap.formBuilder(template.options).data('formBuilder');
        } else {
          var actions = template.formBuilder.actions;
          actions.setData(template.options.formData);
        }
    }
  });
});

Template.formBuilder.events({
  "click #remove-form": function(event,template) {
    event.preventDefault();
    var uid = event.target.value;
    Meteor.call('DynamicForms.remove', uid,
      function(err, res) {
          if (err) {
            alert(err);
          } else {
            var actions = template.formBuilder.actions;
            actions.clearFields();
            // success!
          }
    });
  },
  "click #clear-all": function(event,template) {
    event.preventDefault();
    var actions = template.formBuilder.actions;
    actions.clearFields();
  },
  "click #form-builder-save": function(event,template) {
    event.preventDefault();
    var sel = {};
    var uid = event.target.value;
    if (uid) { sel._id = uid; } else {
      var name = $("#form-machine-uid").val();
      sel.name = name;
    }
    if (sel) {
      var data = JSON.parse(template.formBuilder.formData);
      if (data.length > 0) {
        Meteor.call('DynamicForms.insert', sel, data,
          function(err, res) {
              if (err) {
                alert(err);
              } else {
                // success!
                template.name = DynamicForms.findOne(sel).name;
              }
        });
      } else {
        alert("Form empty, Nothing to save");
      }
    } else {
      alert("You must assign a machine name to the form");
    }
  }
});
