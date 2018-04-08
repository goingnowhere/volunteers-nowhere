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
		"name": "textarea-1511695651949",
		"rows": "5"
	},
	{
		"type": "radio-group",
		"label": "Gender",
		"description": "This info is used in particular shifts where a specific gender is required.",
		"inline": true,
		"name": "radio-group-1523175199854",
		"values": [
			{
				"label": "Male",
				"value": "male"
			},
			{
				"label": "Female",
				"value": "female"
			},
			{
				"label": "In Between",
				"value": "between"
			}
		]
	},
	{
		"type": "checkbox-group",
		"label": "Grave Allergies",
		"description": "We have to take you to the hospital.",
		"inline": true,
		"name": "checkbox-group-1516817336171",
		"values": [
			{
				"label": "Gluten/Celiac",
				"value": "celiac"
			},
			{
				"label": "Fish/Shellfish",
				"value": "shellfish"
			},
			{
				"label": "Peanuts/Nuts",
				"value": "nuts"
			},
			{
				"label": "Tree nuts",
				"value": "treenuts"
			},
			{
				"label": "Soy",
				"value": "soy"
			},
			{
				"label": "Egg",
				"value": "egg"
			},
			{
				"label": "I'm DavidB",
				"value": "davidb"
			}
		]
	},
	{
		"type": "checkbox-group",
		"label": "Food Intollerances",
		"description": "You are not going to die if you come in contacts with traces of these common allergens. There might be contamination. Please be flexible and come talk to us for very special requirements.",
		"inline": true,
		"name": "checkbox-group-1523174426198",
		"values": [
			{
				"label": "Intolerance to gluten ",
				"value": "gluten"
			},
			{
				"label": "Peppers",
				"value": "peppers"
			},
			{
				"label": "Fish/shellfish",
				"value": "shellfish"
			},
			{
				"label": "Peanuts/Nuts",
				"value": "nuts"
			},
			{
				"label": "Egg",
				"value": "egg"
			},
			{
				"label": "Milk/Lactose",
				"value": "lactose"
			},
			{
				"label": "Other",
				"value": "other"
			}
		]
	},
	{
		"type": "checkbox-group",
		"label": "Food Preference",
		"description": "The local producer we use for meat is not certified hallal   and our kitchen is not kosher.",
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
			},
			{
				"label": "Fishetarian ( no meat, but fish ok)",
				"value": "fish"
			}
		]
	},
	{
		"type": "textarea",
		"label": "Experience as volunteer at Burn?",
		"description": "When  how ?",
		"className": "form-control",
		"name": "textarea-1523175003065",
		"rows": "3"
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
