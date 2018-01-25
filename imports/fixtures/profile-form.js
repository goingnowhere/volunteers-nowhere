const form = [
	{
		"type": "text",
		"label": "Name / PlayaName",
		"className": "form-control",
		"name": "text-1511694619820"
	},
	{
		"type": "textarea",
		"label": "Bio",
		"className": "form-control",
		"name": "textarea-1511695651949"
	},
	{
		"type": "select",
		"label": "lalal",
		"className": "form-control",
		"name": "select-1516830576815",
		"values": [
			{
				"label": "Option 1",
				"value": "option-1",
				"selected": true
			},
			{
				"label": "Option 2",
				"value": "option-2"
			},
			{
				"label": "Option 3",
				"value": "option-3"
			}
		]
	},
	{
		"type": "date",
		"required": true,
		"label": "Arrival Date",
		"className": "form-control",
		"name": "date-1516817303811"
	},
	{
		"type": "checkbox-group",
		"label": "Dietary Restrictions",
		"inline": true,
		"name": "checkbox-group-1516817336171",
		"values": [
			{
				"label": "Celiac",
				"value": "celiac"
			},
			{
				"label": "Gluten intolerant ",
				"value": "gluten"
			}
		]
	},
	{
		"type": "checkbox-group",
		"label": "Foodwise, are you",
		"name": "checkbox-group-1516823589180",
		"values": [
			{
				"label": "Omnivore",
				"value": "omnivore",
				"selected": true
			},
			{
				"label": "Vegetarian",
				"value": "vegetarian"
			},
			{
				"label": "Vegan",
				"value": "vegan"
			}
		]
	},
	{
		"type": "text",
		"label": "Where will you be camping ?",
		"className": "form-control",
		"name": "text-1516823538432"
	},
	{
		"type": "textarea",
		"label": "Any Medical Conditions we should be aware of ?",
		"className": "form-control",
		"name": "textarea-1516823680441"
	},
	{
		"type": "checkbox-group",
		"label": "Which languages do you speak ?",
		"inline": true,
		"name": "checkbox-group-1516823735515",
		"values": [
			{
				"label": "English",
				"value": "english",
				"selected": true
			},
			{
				"label": "French",
				"value": "french"
			},
			{
				"label": "Spanish",
				"value": "spanish"
			},
			{
				"label": "German",
				"value": "german"
			},
			{
				"label": "Italian",
				"value": "italian"
			},
			{
				"label": "Other",
				"value": "other"
			}
		]
	},
	{
		"type": "text",
		"label": "Emergency Contact on Site ?",
		"className": "form-control",
		"name": "text-1516823884058"
	},
	{
		"type": "text",
		"label": "Anything Else ?",
		"className": "form-control",
		"name": "text-1516823974420"
	}
]

export const createForm = (Volunteers) => {
  console.log('Initializing User Form')
  Volunteers.setUserForm(form)
}
