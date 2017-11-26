import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

Template._header.helpers
  'isManagerOrLead': () -> Volunteers.isManagerOrLead(Meteor.userId())
