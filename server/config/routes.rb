Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }

  devise_scope :user do
    get 'users/edit_email' => 'devise/registrations#edit_email', as: :edit_user_email
    put 'users/edit_email' => 'users/registrations#update_email', as: :update_user_email

    get 'users/edit_password' => 'devise/registrations#edit_password', as: :edit_authed_user_password
    put 'users/edit_password' => 'users/registrations#update_password', as: :update_authed_user_password

    patch 'users/edit_name' => 'users/registrations#update_name', as: :update_authed_user_name
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

  resources :clients do
    resources :measurements, controller: 'client_measurements', only: [:index, :create] do
      collection do
        get 'ndt7_index'
      end
    end

    member do
      delete 'release'
      post 'configuration'
      post 'status'
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

  post 'geocode', to: 'geocode#code'
  post 'reverse_geocode', to: 'geocode#reverse_code'
  get 'dashboard', to: 'dashboard#index'
  
  resources :exports do
    collection do
      get 'all'
    end
  end

  namespace 'api' do
    namespace 'v1' do
      resources :client_versions, constraints: {id: /[^\/]+/} do
        resources :distributions
        resources :packages
      end
    end
  end

  namespace 'client_api' do
    namespace 'v1' do
      options 'geocode', to: 'geolocation#code'
      post 'geocode', to: 'geolocation#code'
      options 'raw', to: 'raw_data#raw'
      post 'raw', to: 'raw_data#raw'
      get 'raw', to: 'raw_data#get_raw'
    end
  end

  #root to: 'home#home'
  root to: redirect('/users/sign_in')
end
