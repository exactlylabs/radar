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

  resources :measurements, only: [:index] do
    collection do
      get 'full_index'
      get 'full_ndt7_index'
    end
  end

  resources :locations do
    member do
      post 'request_test'
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

  resources :exports do
    collection do
      get 'all'
    end
  end

  resources :accounts do
    collection do
      post 'switch', to: "accounts#switch"
      post 'all_accounts', to: "accounts#all_accounts"
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
  end

  resources :invites do
    collection do
      post 'resend', to: 'invites#resend'
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

  # Public access pages - Pod status from labels
  get 'check', to: 'public_pod#index'
  post 'check_id', to: 'public_pod#check_id'
  get '/setup/:pod_id', to: 'public_pod#setup'
  get '/check/:pod_id', to: 'public_pod#status'
  get 'find_pod', to: 'public_pod#find_pod'
  get '/update_public_page/:pod_id', to: 'public_pod#update_public_page'
  get '/supported-browsers', to: 'public#supported_browsers'

  # root to: 'home#home'
  root to: redirect('/users/sign_in')
end
