This meteor project depends other modules for all its functionalities.
The look and feel of this project was left intentionally blank to focus on the development of functionality, more than on the UI.

To run this project you must install meteor, checkout from a sister repository all additional modules and set the env variable `METEOR_PACKAGE_DIRS` accordingly.
e.g. after [installing Meteor](https://www.meteor.com/install):

``` bash
mkdir nowhere-volunteers
cd nowhere-volunteers
git clone git@gitlab.com:abate/volunteers.git
# main meteor-volunteers dependency
git clone git@gitlab.com:abate/meteor-volunteers.git
# dependencies
git clone git@gitlab.com:abate/meteor-autoform-components.git
git clone git@github.com:abate/meteor-autoform-datetimepicker.git
git clone git@gitlab.com:abate/meteor-formbuilder.git
# install npm dependencies and run
cd volunteers
meteor npm install
METEOR_PACKAGE_DIRS=../ meteor
```

The volunteer facing site is at http://localhost:3000/, the admin panel is at http://localhost:3000/admin

The admin password is admin@example.com / apple1
