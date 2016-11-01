import ViewingActionType from "discourse/mixins/viewing-action-type";
import UserGarage from 'discourse/models/user-garage';

export default Discourse.Route.extend(ViewingActionType, {
  model() {
    return UserGarage.findByUsername(this.modelFor("user").get("username_lower"), { grouped: true });
  },

  setupController(controller, model) {
    this.viewingActionType(-1);
    controller.set("model", model);
  },

  renderTemplate() {
    this.render("user/garage", {into: "user"});
  },

  actions: {
    didTransition() {
      this.controllerFor("application").set("showFooter", true);
      return true;
    }
  }
});
