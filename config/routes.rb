Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }

  devise_scope :user do
    get 'users/edit_email' => 'devise/registrations#edit_email', as: :edit_user_email
    put 'users/edit_email' => 'users/registrations#update_email', as: :update_user_email

    get 'users/edit_password' => 'devise/registrations#edit_password', as: :edit_authed_user_password
    put 'users/edit_password' => 'users/registrations#update_password', as: :update_authed_user_password
    
    patch 'users/edit_name' => 'users/registrations#update_name', as: :update_authed_user_name
  end

  resources :locations do
    resources :measurements, controller: 'location_measurements', only: [:index] do
      collection do
        get 'ndt7_index'
      end
    end
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
    end

    collection do
      post 'claim'
      get 'claim', to: 'clients#claim_form'
    end
  end

  get 'dashboard', to: 'dashboard#index'
  
  #root to: 'home#home'
  root to: redirect('/users/sign_in')
end
