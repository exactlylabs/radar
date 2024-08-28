require 'sidekiq/web'

Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }

  devise_scope :user do
    post 'users/register' => 'users/registrations#create'
    get 'users/edit_email' => 'users/registrations#edit_email', as: :edit_user_email
    put 'users/edit_email' => 'users/registrations#update_email', as: :update_user_email

    get 'users/edit_password' => 'devise/registrations#edit_password', as: :edit_authed_user_password
    put 'users/edit_password' => 'users/registrations#update_password', as: :update_authed_user_password

    patch 'users/edit_name' => 'users/registrations#update_name', as: :update_authed_user_name
    patch 'users/edit_avatar' => 'users/registrations#update_avatar', as: :update_authed_avatar
    patch 'users/edit_name_and_avatar' => 'users/registrations#update_name_and_avatar', as: :update_authed_name_and_avatar

    get 'users/invite_sign_up' => 'users/registrations#render_invite_sign_up'
    post 'users/register_from_invite' => 'users/registrations#create_from_invite'
    get 'users/invite_sign_in' => 'users/registrations#render_invite_sign_in'
    post 'users/sign_in_from_invite' => 'users/registrations#sign_from_invite'

    delete 'users/custom_sign_out' => 'users/registrations#custom_sign_out'

    post 'users/check_email_uniqueness' => 'users/registrations#check_email_uniqueness'
  end

  resources :notification_settings, only: [:index] do
    collection do
      put 'toggle_notification_option', to: 'notification_settings#toggle_notification_option'
    end
  end

  resources :measurements, only: [:index, :show] do
    collection do
      get 'full_index'
      get 'full_ndt7_index'
    end
  end

  resources :locations do

    collection do
      delete 'bulk_destroy', to: 'locations#bulk_destroy'
      get 'move_to_account', to: 'locations#move_to_account'
      post 'bulk_move_networks', to: 'locations#bulk_move_to_account'
      post 'new_network_onboarding', to: 'locations#new_network_onboarding', as: 'new_network_onboarding'
    end

    member do
      post 'request_test'
      get 'speed_average'
    end

    resources :measurements, controller: 'location_measurements', only: [:index] do
      collection do
        get 'ndt7_index'
      end
    end

    resources :clients, controller: 'location_clients', only: [:index]
  end

  get 'locations/account/:account_id', to: 'locations#get_by_account_id'

  resources :clients do
    collection do
      get 'get_add_pod_modal', to: 'clients#get_add_pod_modal'
      post 'check_claimed_pod', to: 'clients#check_claimed_pod'
      delete 'remove_claimed_pod', to: 'clients#remove_claimed_pod'
      post 'move_claimed_pod', to: 'clients#move_claimed_pod'
      post 'save_claimed_pods', to: 'clients#save_claimed_pods'
      post 'add_claimed_pods_to_account_and_network', to: 'clients#add_claimed_pods_to_account_and_network'
      post 'confirm_moving_claimed_pods_to_account_and_network', to: 'clients#confirm_moving_claimed_pods_to_account_and_network'
      post 'claim_new_pod', to: 'clients#claim_new_pod'
      get 'need_help_finding_pod_id', to: 'clients#need_help_finding_pod_id'
      get 'crl', to: 'clients#crl'
    end

    resources :measurements, controller: 'client_measurements', only: [:index, :create, :show] do
      collection do
        get 'ndt7_index'
      end
    end

    get 'technical_info', to: 'client_technical_info#index'
    get 'data_usage_and_scheduling', to: 'client_data_usage_and_scheduling#index'
    put 'data_usage', to: 'client_data_usage_and_scheduling#edit_data_cap'
    put 'scheduling', to: 'client_data_usage_and_scheduling#edit_scheduling'
    put 'enable_scheduling', to: 'client_data_usage_and_scheduling#enable_custom_scheduling'
    put 'enable_data_cap', to: 'client_data_usage_and_scheduling#enable_data_cap'

    member do
      delete 'release'
      post 'status'
      post 'watchdog_status'
      post 'run_test'
      post 'toggle_in_service'
      get 'pdf_label', to: 'clients#get_client_label'
      get 'remove_from_network', to: 'clients#remove_from_network'
      post 'run_public_test'
      get 'speed_average', to: 'clients#speed_average', as: 'speed_average'
      get 'download_speeds', to: 'public_pod#download_speeds'
      get 'upload_speeds', to: 'public_pod#upload_speeds'
      get 'latency', to: 'public_pod#latency'
      get 'data_usage', to: 'public_pod#data_usage'
      get 'total_data', to: 'public_pod#total_data'
    end

    collection do
      get 'status', to: 'clients#public_status'
      post 'status', to: 'clients#check_public_status'
      post 'claim'
      get 'claim', to: 'clients#claim_form'
      get 'check_claim', to: 'clients#check_claim_form'
      post 'check_claim', to: 'clients#check_claim'
      post 'bulk_run_tests'
      delete 'bulk_delete'
      get 'bulk_update_release_group', to: "clients#get_bulk_change_release_group"
      post 'bulk_update_release_group'
      get 'bulk_pdf_labels'
      get 'unclaimed'
      get 'get_bulk_remove_from_network'
      post 'bulk_remove_from_network'
      get 'bulk_move_to_network', to: 'clients#get_bulk_move_to_network'
      post 'bulk_move_to_network'
      post 'new_pod_onboarding', to: 'clients#new_pod_onboarding', as: 'new_pod_onboarding'
      post 'claim_pod_onboarding', to: 'clients#claim_pod_onboarding', as: 'claim_pod_onboarding'
      get 'bulk_move_to_account', to: 'clients#get_bulk_move_to_account'
      post 'bulk_move_to_account', to: 'clients#bulk_move_to_account'
      get 'bulk_move_to_network_qr', to: 'clients#get_bulk_move_to_network_qr'
      post 'bulk_move_to_network_qr', to: 'clients#bulk_move_to_network_qr'
      put 'bulk_move_pods_to_account_step_one', to: 'clients#bulk_move_pods_to_account_step_one', as: 'bulk_move_pods_to_account_step_one'
      put 'go_back_bulk_move_pods_to_account', to: 'clients#go_back_bulk_move_pods_to_account', as: 'go_back_bulk_move_pods_to_account'
      put 'bulk_move_pods_to_network_step_one', to: 'clients#bulk_move_pods_to_network_step_one', as: 'bulk_move_pods_to_network_step_one'
      put 'go_back_bulk_move_pods_to_network', to: 'clients#go_back_bulk_move_pods_to_network', as: 'go_back_bulk_move_pods_to_network'
    end
  end

  resources :pods, controller: :clients do
    resources :measurements, controller: 'client_measurements', only: [:index, :create, :show] do
      collection do
        get 'ndt7_index'
      end
    end

    get 'technical_info', to: 'client_technical_info#index'
    get 'data_usage_and_scheduling', to: 'client_data_usage_and_scheduling#index'
    put 'data_usage', to: 'client_data_usage_and_scheduling#edit_data_cap'
    put 'scheduling', to: 'client_data_usage_and_scheduling#edit_scheduling'
    put 'enable_scheduling', to: 'client_data_usage_and_scheduling#enable_custom_scheduling'
    put 'enable_data_cap', to: 'client_data_usage_and_scheduling#enable_data_cap'

    member do
      delete 'release'
      post 'status'
      post 'watchdog_status'
      post 'run_test'
      post 'toggle_in_service'
      get 'pdf_label', to: 'clients#get_client_label'
      post 'run_public_test'
    end

    collection do
      get 'status', to: 'clients#public_status'
      post 'status', to: 'clients#check_public_status'
      post 'claim'
      get 'claim', to: 'clients#claim_form'
      get 'check_claim', to: 'clients#check_claim_form'
      post 'check_claim', to: 'clients#check_claim'
      post 'bulk_run_tests'
      delete 'bulk_delete'
      post 'bulk_update_release_group'
      get 'bulk_pdf_labels'
      get 'unclaimed'
    end
  end

  resources :update_groups do
    member do
      post 'default', to: 'update_groups#set_as_default'
    end
  end

  resources :client_versions, constraints: { id: /[^\/]+/ } do
    resources :distributions do
      member do
        get 'download'
      end
    end
    resources :packages do
      member do
        get 'download'
      end
    end
  end

  resources :watchdog_versions, constraints: { id: /[^\/]+/ } do
    member do
      get 'download'
    end
  end

  post 'geocode', to: 'geocode#code'
  post 'reverse_geocode', to: 'geocode#reverse_code'
  post 'suggestions', to: 'geocode#suggestions'
  get 'dashboard', to: 'dashboard#index'
  get 'search_locations', to: 'dashboard#search_locations'
  get 'onboarding_step_1', to: 'dashboard#onboarding_step_1'
  get 'onboarding_step_2', to: 'dashboard#onboarding_step_2'
  get 'onboarding_step_3', to: 'dashboard#onboarding_step_3'
  get 'online_pods', to: 'dashboard#online_pods'
  get 'download_speeds', to: 'dashboard#download_speeds'
  get 'upload_speeds', to: 'dashboard#upload_speeds'
  get 'latency', to: 'dashboard#latency'
  get 'data_usage', to: 'dashboard#data_usage'
  get 'outages', to: 'dashboard#outages'
  get 'total_data', to: 'dashboard#total_data'
  get 'all_filters', to: 'dashboard#all_filters'

  get 'comparison_dashboard', to: 'comparison_dashboard#index'
  get 'comparison_online_pods', to: 'comparison_dashboard#online_pods'
  get 'comparison_download_speeds', to: 'comparison_dashboard#download_speeds'
  get 'comparison_upload_speeds', to: 'comparison_dashboard#upload_speeds'
  get 'comparison_latency', to: 'comparison_dashboard#latency'
  get 'comparison_data_usage', to: 'comparison_dashboard#data_usage'
  get 'comparison_total_data', to: 'comparison_dashboard#total_data'

  resources :exports do
    collection do
      get 'all'
    end
  end

  resources :accounts do
    collection do
      post 'switch', to: "accounts#switch"
      post 'all_accounts', to: "accounts#all_accounts"
      post 'new_account_onboarding', to: "accounts#new_account_onboarding", as: 'new_account_onboarding'
      post 'onboarding_account', to: "accounts#onboarding_account", as: 'onboarding_account'
    end
    member do
      post :edit
      get :delete
      get :add_member
    end
  end

  get 'users_account/shared', to: 'users_account#shared'

  resources :shared_users_accounts do
    collection do
      post 'delegate', to: 'shared_users_account#delegate_access'
    end
  end

  resources :users_account do
    collection do
      delete 'bulk_delete'
    end
  end

  get 'pending_invites_panel', to: "invites#pending_invites_panel", as: "pending_invites_panel"
  resources :invites do
    member do
      post :accept
      delete :decline
    end
    collection do
      get 'invite_modal', to: 'invites#invite_modal'
      post 'resend', to: 'invites#resend'
    end
  end

  resources :feature_flags do
    member do
      get :delete
      put :toggle
    end
  end

  get '/account_categories/open_dropdown', to: 'account_categories#open_dropdown', as: 'account_categories_open_dropdown'
  get '/account_categories/close_dropdown', to: 'account_categories#close_dropdown', as: 'account_categories_close_dropdown'
  put '/account_categories/selected_categories', to: 'account_categories#change_selected_categories', as: 'account_category_update_categories'
  get '/account_categories/search', to: 'account_categories#search', as: 'account_category_search'

  put '/location_categories/selected_categories', to: 'location_categories#change_selected_categories', as: 'location_category_update_categories'
  get '/location_categories/search', to: 'location_categories#search', as: 'location_category_search'
  get '/location_categories/open_dropdown', to: 'location_categories#open_dropdown', as: 'categories_open_dropdown'
  get '/location_categories/close_dropdown', to: 'location_categories#close_dropdown', as: 'categories_close_dropdown'
  get '/location_categories/import_from_another_account', to: 'location_categories#import_from_another_account', as: 'categories_import_from_another_account'
  post '/location_categories/import', to: 'location_categories#import', as: 'categories_import'

  get '/categories/cancel_new', to: 'categories#cancel_new', as: 'category_cancel_new'

  resources :categories, param: :id do
    collection do
      get 'import_from_another_account', to: 'categories#import_from_another_account'
      post 'import', to: 'categories#import'
    end
  end
  get '/categories/:id/delete', to: 'categories#delete', as: 'category_delete'
  get '/categories/:id/edit', to: 'categories#edit', as: 'category_edit'
  get '/categories/:id/cancel', to: 'categories#cancel_edit', as: 'category_cancel_edit'

  namespace 'api' do
    namespace 'v1' do
      resources :clients do
        collection do
          mount ActionCable.server => '/ws'
          post "assign"
          get "me"
        end
      end
      resources :client_versions, constraints: { id: /[^\/]+/ } do
        resources :distributions
        resources :packages
      end
      resources :watchdog_versions, constraints: { id: /[^\/]+/ }
    end
  end

  namespace 'client_api' do
    namespace 'v1' do
      match '*path', controller: 'api', action: 'check_preflight', via: :options
      resources :speed_tests, controller: 'speed_tests', only: [:index, :create, :update]
      get 'tests_with_bounds', to: 'speed_tests#tests_with_bounds'
      post 'geocode', to: 'geolocation#code'
      post 'suggestions', to: 'geolocation#suggestions'
      post 'coordinates', to: 'geolocation#coordinates'
      get 'user_coordinates', to: 'geolocation#user_coordinates'
      post 'sentry', to: 'sentry#tunnel'
      mount ActionCable.mobile_server => '/ws'
    end
  end

  get 'search', to: 'search#index'

  # Public access pages - Pod status from labels
  get 'check', to: 'public_pod#index'
  post 'check_id', to: 'public_pod#check_id'
  get '/setup/:pod_id', to: 'public_pod#setup'
  get '/check/:pod_id', to: 'public_pod#status'
  get 'find_pod', to: 'public_pod#find_pod'
  get '/update_public_page/:pod_id', to: 'public_pod#update_public_page'
  get '/supported-browsers', to: 'public#supported_browsers'

  get '/TTUHSC', to: 'mailer#redirect_to_ttuhsc'
  get '/TTUHSC/:id', to: 'mailer#redirect_campaign_to_ttuhsc'

  get '/TBP', to: 'public#landing'
  get '/tbp', to: redirect('/TBP')
  get '/Tbp', to: redirect('/TBP')
  get '/tBp', to: redirect('/TBP')
  get '/tbP', to: redirect('/TBP')
  get '/TBp', to: redirect('/TBP')
  get '/TbP', to: redirect('/TBP')
  get '/tBP', to: redirect('/TBP')

  get '/GO', to: 'mailer#redirect_go_campaign'

  get '/get_started_modal', to: 'public#get_started_modal'
  post '/get_started_modal_step_1_submit', to: 'public#get_started_modal_step_1_submit'
  get '/get_started_modal_step_2', to: 'public#get_started_modal_step_2'
  post '/get_started_modal_step_2_submit', to: 'public#get_started_modal_step_2_submit'

  resources :outages do
    collection do
      get 'detail_modal', to: 'outages#detail_modal'
    end
  end

  # Sidekiq web UI, only accessible by admins
  authenticate :user, ->(u) { u.super_user? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  root to: redirect('/users/sign_in')
end
