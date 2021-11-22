Rails.application.routes.draw do
  resources :locations do
    resources :measurements, controller: 'location_measurements' do
      collection do
        get 'ndt7_index'
      end
    end
  end

  resources :clients do
    resources :measurements, controller: 'client_measurements' do
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

  devise_for :users
  
  root to: 'home#home'
end
