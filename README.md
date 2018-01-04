## Background

This project aims to be a complete volunteer management system for the [Nowhere](www.goingnowhere.org) event. As much as possible the functionality is implemented in a general purpose [Meteor module](https://gitlab.com/abate/meteor-volunteers), the intention of which is to be a reusable dependency for other volunteer run events and projects.

## Development

Once running, the volunteer facing site is at http://localhost:3000/, the admin panel is at http://localhost:3000/admin

The admin password is admin@example.com / apple1

The majority of the code is written in Coffeescript, but the intention is to migrate this to Javascript for greater accessibility to developers. Meteor is used as a framework, using Blaze as a view layer.

### Git submodule install

To run this project you must [install meteor](https://www.meteor.com/install) and checkout all additional modules. This can be done in one step by using git submodules, though it may require you to have a Github and Gitlab accounts set up with SSH keys set up (all the code is public but since we use SSH urls for the repositories hosted on Github and Gitlab you need an account, an [alternative install method](#non-ssh-install) exists if you don't want to set this up):

``` bash
git clone git@gitlab.com:abate/volunteers-nowhere.git --recurse-submodules
cd volunteers-nowhere
meteor npm install
meteor
```

### Non-SSH install

You'll need to clone each dependency in turn and tell Meteor where to find them when you run it:

``` bash
mkdir nowhere-volunteers
cd nowhere-volunteers
git clone https://gitlab.com/abate/volunteers-nowhere.git
# main meteor-volunteers dependency
git clone https://gitlab.com/abate/meteor-volunteers.git
# dependencies
git clone https://gitlab.com/abate/meteor-autoform-components.git
git clone https://github.com/abate/meteor-autoform-datetimepicker.git
git clone https://gitlab.com/abate/meteor-formbuilder.git
git clone https://github.com/piemonkey/meteor-roles.git
git clone https://gitlab.com/abate/meteor-user-profiles.git
# install npm dependencies and run
cd volunteers-nowhere
meteor npm install
METEOR_PACKAGE_DIRS=../ meteor
```
