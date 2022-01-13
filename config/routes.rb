Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }

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
