import { ajax } from 'discourse/lib/ajax';
import Garage from 'discourse/models/garage';

const UserGarage = Discourse.Model.extend({
  postUrl: function() {
    if(this.get('topic_title')) {
      return "/t/-/" + this.get('topic_id') + "/" + this.get('post_number');
    }
  }.property(), // avoid the extra bindings for now

  revoke() {
    return ajax("/user_badges/" + this.get('id'), {
      type: "DELETE"
    });
  }
});

UserGarage.reopenClass({

  createFromJson: function(json) {
    // Create User objects.
    if (json.users === undefined) { json.users = []; }
    var users = {};
    json.users.forEach(function(userJson) {
      users[userJson.id] = Discourse.User.create(userJson);
    });

    // Create Topic objects.
    if (json.topics === undefined) { json.topics = []; }
    var topics = {};
    json.topics.forEach(function(topicJson) {
      topics[topicJson.id] = Discourse.Topic.create(topicJson);
    });

    // Create the badges.
    if (json.badges === undefined) { json.badges = []; }
    var badges = {};
    //Garage.createFromJson(json).forEach(function(badge) {
    //  console.log(badge);
    //  badges[badge.get('id')] = badge;
    //});

    // Create UserGarage object(s).
    var userGarags = [];
    if ("user_garage" in json) {
      userGarags = [json.user_garage];
    }

    userGarags = userGarags.map(function(userBadgeJson) {
      var userGarag = UserGarage.create(userBadgeJson);

      return userGarag;
    });

    if ("user_garage" in json) {
      return userGarags[0];
    }
  },

  /**
    Find all badges for a given username.
    @method findByUsername
    @param {String} username
    @param {Object} options
    @returns {Promise} a promise that resolves to an array of `UserGarage`.
  **/
  findByUsername: function(username, options) {
    var url = "/user-garage/" + username + ".json";
    /** выкл модель групинг
    if (options && options.grouped) {
      url += "?grouped=true";
    }
    **/
    return ajax(url).then(function(json) {
      return UserGarage.createFromJson(json);
    });
  },

  /**
    Find all badge grants for a given badge ID.
    @method findById
    @param {String} badgeId
    @returns {Promise} a promise that resolves to an array of `UserGarage`.
  **/
  findByBadgeId: function(badgeId, options) {
    if (!options) { options = {}; }
    options.badge_id = badgeId;

    return ajax("/user_badges.json", {
      data: options
    }).then(function(json) {
      return UserGarage.createFromJson(json);
    });
  },

  /**
    Grant the badge having id `badgeId` to the user identified by `username`.
    @method grant
    @param {Integer} badgeId id of the badge to be granted.
    @param {String} username username of the user to be granted the badge.
    @returns {Promise} a promise that resolves to an instance of `UserGarage`.
  **/
  grant: function(badgeId, username, reason) {
    return ajax("/user_badges", {
      type: "POST",
      data: {
        username: username,
        badge_id: badgeId,
        reason: reason
      }
    }).then(function(json) {
      return UserGarage.createFromJson(json);
    });
  }
});

export default UserGarage;
