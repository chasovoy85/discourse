class UserGarageController < ApplicationController

  def username
    params.permit [:grouped]

    user = fetch_user_from_params
    
    user_garage = {:user_garage=>[
              {:car_id=>1, :car_name=>"Супер Тачила 1"}, 
              {:car_id=>2, :car_name=>"Супер Тачила 2"}
            ]}

    render :json=>user_garage
  end

  private

    # Get the badge from either the badge name or id specified in the params.
    def fetch_badge_from_params
      badge = nil

      params.permit(:badge_name)
      if params[:badge_name].nil?
        params.require(:badge_id)
        badge = Badge.find_by(id: params[:badge_id], enabled: true)
      else
        badge = Badge.find_by(name: params[:badge_name], enabled: true)
      end
      raise Discourse::NotFound if badge.blank?

      badge
    end

    def can_assign_badge_to_user?(user)
      master_api_call = current_user.nil? && is_api?
      master_api_call or guardian.can_grant_badges?(user)
    end
end
