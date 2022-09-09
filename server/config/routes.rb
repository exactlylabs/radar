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

    get 'users/invite_sign_up' => 'users/registrations#render_invite_sign_up'
    post 'users/register_from_invite' => 'users/registrations#create_from_invite'
    get 'users/invite_sign_in' => 'users/registrations#render_invite_sign_in'
    post 'users/sign_in_from_invite' => 'users/registrations#sign_from_invite'

    delete 'users/custom_sign_out' => 'users/registrations#custom_sign_out'

    post 'users/check_email_uniqueness_on_cold_sign_up' => 'users/registrations#check_email_uniqueness_on_cold_sign_up'
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
    resources :measurements, controller: 'client_measurements', only: [:index, :create] do
      collection do
        get 'ndt7_index'
      end
    end

    member do
      delete 'release'
      post 'status'
      post 'watchdog_status'
      post 'run_test'
    end

    collection do
      get 'status', to: 'clients#public_status'
      post 'status', to: 'clients#check_public_status'
      post 'claim'
      get 'claim', to: 'clients#claim_form'
      get 'check_claim', to: 'clients#check_claim_form'
      post 'check_claim', to: 'clients#check_claim'
    end
  end

  resources :staging_clients do
    member do
      post 'publish'
    end
  end

  resources :client_versions, constraints: {id: /[^\/]+/} do
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

  resources :watchdog_versions, constraints: {id: /[^\/]+/} do
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
    end
    member do
      post :edit
      get :delete
    end
  end

  resources :users_account do
  end

  resources :invites do
    collection do
      post 'resend', to: 'invites#resend'
    end
  end

  namespace 'api' do
    namespace 'v1' do
      resources :client_versions, constraints: {id: /[^\/]+/} do
        resources :distributions
        resources :packages
      end
      resources :watchdog_versions, constraints: {id: /[^\/]+/}
    end
  end

  namespace 'client_api' do
    namespace 'v1' do
      resources :speed_tests, controller: 'speed_tests', only: [:index, :create]
      post 'geocode', to: 'geolocation#code'
      post 'suggestions', to: 'geolocation#suggestions'
      post 'coordinates', to: 'geolocation#coordinates'
      get 'user_coordinates', to: 'geolocation#user_coordinates'
    end
  end

  #root to: 'home#home'
  root to: redirect('/users/sign_in')
end
