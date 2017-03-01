SimpleSchema.extendOptions({
  placeholder: Match.Optional(String),
  instructions: Match.Optional(String),
});

function SSType (e) {
  var obj = {
    type: e.jsType,
    label: e.label,
    instructions: e.description || "",
    placeholder: e.placeholder || "",
    optional: (!(typeof e.required !== 'undefined'))
  };
  if (Object.prototype.toString.call( e.values ) === '[object Array]') {
    obj.allowedValues = e.values.map(function (e) { return e.value; });
  }
  return ({ [e.name]: obj });
}

toSimpleSchema = function(a) {
  var res = {};
  if (a) {
    a.form.forEach(function (e) {
      switch (e.type) {
        case "number":
          e.jsType = Number;
          break;
        case "date":
          e.jsType = Date;
          break;
        case "checkbox":
          e.jsType = Boolean;
          break;
        case "select":
          e.jsType = ((e.multiple === true) ? [String] : String);
          break;
        default :
          e.jsType = String;
      }
      _.extend(res,SSType(e));
    });
    return new SimpleSchema(res);
  }
};

attachFormBuilderSchema = function(schema,formname) {
  Meteor.subscribe("FormBuilder.dynamicForms", function() {
    var ss = toSimpleSchema(DynamicForms.findOne({name: formname}));
    return new SimpleSchema([schema,ss]);
  });
};
