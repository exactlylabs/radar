Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }

  devise_scope :user do
    post 'users/register' => 'users/registrations#create'
    get 'users/edit_email' => 'devise/registrations#edit_email', as: :edit_user_email
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

  get 'location/:location_id/clients/add_pod_to_network_modal', to: 'location_clients#get_add_pod_to_network_modal', as: :get_add_pod_to_network_modal
  get 'location/:location_id/clients/add_new_pod_to_network_modal', to: 'location_clients#get_add_new_pod_to_network_modal', as: :get_add_new_pod_to_network_modal
  post 'location/:location_id/clients/add_new_pod_to_network', to: 'location_clients#add_new_pod_to_network', as: :add_new_pod_to_network
  get 'location/:location_id/clients/add_existing_pod_to_network_modal', to: 'location_clients#get_add_existing_pod_to_network_modal', as: :get_add_existing_pod_to_network_modal
  post 'location/:location_id/clients/add_existing_pod_to_network', to: 'location_clients#add_existing_pod_to_network', as: :add_existing_pod_to_network

  get 'locations/account/:account_id', to: 'locations#get_by_account_id'

  get 'clients/get_add_pod_modal', to: 'clients#get_add_pod_modal', as: :get_add_pod_modal
  post 'clients/check_claim_new_pod', to: 'clients#check_claim_new_pod', as: :check_claim_new_pod
  post 'clients/claim_new_pod', to: 'clients#claim_new_pod', as: :claim_new_pod

  resources :clients do
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
      get 'speed_average', to: 'clients#speed_average', as: 'speed_average'
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
  get 'dashboard', to: 'dashboard#index'
  get 'dashboard_comparison', to: 'dashboard#comparison'
  get 'search_locations', to: 'dashboard#search_locations'
  get 'onboarding_step_1', to: 'dashboard#onboarding_step_1'
  get 'onboarding_step_2', to: 'dashboard#onboarding_step_2'
  get 'onboarding_step_3', to: 'dashboard#onboarding_step_3'
  get 'online_pods', to: 'dashboard#online_pods'
  get 'download_speeds', to: 'dashboard#download_speeds'
  get 'upload_speeds', to: 'dashboard#upload_speeds'
  get 'latency', to: 'dashboard#latency'
  get 'data_usage', to: 'dashboard#data_usage'
  get 'compare_download_speeds', to: 'dashboard#compare_download_speeds'

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
      post 'resend', to: 'invites#resend'
    end
  end

  resources :feature_flags do
    member do
      get :delete
      put :toggle
    end
  end

  put '/location_categories/selected_categories', to: 'location_categories#change_selected_categories', as: 'location_category_update_categories'
  get '/location_categories/search', to: 'location_categories#search', as: 'location_category_search'
  get '/location_categories/open_dropdown', to: 'location_categories#open_dropdown', as: 'categories_open_dropdown'
  get '/location_categories/close_dropdown', to: 'location_categories#close_dropdown', as: 'categories_close_dropdown'

  get '/categories/cancel_new', to: 'categories#cancel_new', as: 'category_cancel_new'
  resources :categories, param: :id do
  end
  get '/categories/:id/delete', to: 'categories#delete', as: 'category_delete'
  get '/categories/:id/edit', to: 'categories#edit', as: 'category_edit'
  get '/categories/:id/cancel', to: 'categories#cancel_edit', as: 'category_cancel_edit'


  namespace 'api' do
    namespace 'v1' do
      resources :clients do
        collection do
          mount ActionCable.server => '/ws'
        end
      end
      resources :client_versions, constraints: {id: /[^\/]+/} do
        resources :distributions
        resources :packages
      end
      resources :watchdog_versions, constraints: { id: /[^\/]+/ }
    end
  end

  namespace 'client_api' do
    namespace 'v1' do
      match '*path', controller: 'api', action: 'check_preflight', via: :options
      resources :speed_tests, controller: 'speed_tests', only: [:index, :create]
      get 'tests_with_bounds', to: 'speed_tests#tests_with_bounds'
      post 'geocode', to: 'geolocation#code'
      post 'suggestions', to: 'geolocation#suggestions'
      post 'coordinates', to: 'geolocation#coordinates'
      get 'user_coordinates', to: 'geolocation#user_coordinates'
      post 'sentry', to: 'sentry#tunnel'
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

  # root to: 'home#home'
  root to: redirect('/users/sign_in')
end
