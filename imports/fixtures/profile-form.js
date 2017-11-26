form = [
	{
		"type": "text",
		"label": "Name",
		"className": "form-control",
		"name": "text-1511694619820",
		"subtype": "text"
	},
	{
		"type": "textarea",
		"label": "Bio",
		"className": "form-control",
		"name": "textarea-1511695651949",
		"subtype": "textarea"
	}
];

var createForm = function (Volunteers) {
	console.log("Initializing User Form");
  Volunteers.setUserForm(form)
}

module.exports = createForm;
