Template.registerHelper "debug", (optionalValue) ->
  console.log("Current Context")
  console.log("====================")
  console.log(this)

  if optionalValue
    console.log("Value")
    console.log("====================")
    console.log(optionalValue)

Template.registerHelper "getUserName", (userId) -> getUserName(userId)
