import { ajax } from 'discourse/lib/ajax';
/**
Наверно это мусор
import BadgeGrouping from 'discourse/models/badge-grouping';
**/
import RestModel from 'discourse/models/rest';

const Garage = RestModel.extend({

  newBadge: Em.computed.none('id'),

  url: function() {
    return Discourse.getURL(`/badges/${this.get('id')}/${this.get('slug')}`);
  }.property(),

  /**
    Update this badge with the response returned by the server on save.
    @method updateFromJson
    @param {Object} json The JSON response returned by the server
  **/
  updateFromJson: function(json) {
    const self = this;
    if (json.badge) {
      Object.keys(json.badge).forEach(function(key) {
        self.set(key, json.badge[key]);
      });
    }
    if (json.badge_types) {
      json.badge_types.forEach(function(badgeType) {
        if (badgeType.id === self.get('badge_type_id')) {
          self.set('badge_type', Object.create(badgeType));
        }
      });
    }
  },

  badgeTypeClassName: function() {
    const type = this.get('badge_type.name') || "";
    return "badge-type-" + type.toLowerCase();
  }.property('badge_type.name'),

  /**
    Save and update the badge from the server's response.
    @method save
    @returns {Promise} A promise that resolves to the updated `Badge`
  **/
  save: function(data) {
    let url = "/admin/badges",
        requestType = "POST";
    const self = this;

    if (this.get('id')) {
      // We are updating an existing badge.
      url += "/" + this.get('id');
      requestType = "PUT";
    }

    return ajax(url, {
      type: requestType,
      data: data
    }).then(function(json) {
      self.updateFromJson(json);
      return self;
    }).catch(function(error) {
      throw error;
    });
  },

  /**
    Destroy the badge.
    @method destroy
    @returns {Promise} A promise that resolves to the server response
  **/
  destroy: function() {
    if (this.get('newBadge')) return Ember.RSVP.resolve();
    return ajax("/admin/badges/" + this.get('id'), {
      type: "DELETE"
    });
  }
});

Garage.reopenClass({
  /**
    Create `Badge` instances from the server JSON response.
    @method createFromJson
    @param {Object} json The JSON returned by the server
    @returns Array or instance of `Badge` depending on the input JSON
  **/
  createFromJson: function(json) {
    console.log(json);
    //Тут надо что-то сделать
    return json['user_garage'];
  },

  /**
    Find all `Badge` instances that have been defined.
    @method findAll
    @returns {Promise} a promise that resolves to an array of `Badge`
  **/
  findAll: function(opts) {
    let listable = "";
    if(opts && opts.onlyListable){
      listable = "?only_listable=true";
    }
    return ajax('/badges.json' + listable, { data: opts }).then(function(badgesJson) {
      return Garage.createFromJson(badgesJson);
    });
  },

  /**
    Returns a `Badge` that has the given ID.
    @method findById
    @param {Number} id ID of the badge
    @returns {Promise} a promise that resolves to a `Badge`
  **/
  findById: function(id) {
    return ajax("/badges/" + id).then(function(badgeJson) {
      return Garage.createFromJson(badgeJson);
    });
  }
});

export default Garage;
