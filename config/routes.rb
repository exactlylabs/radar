Rails.application.routes.draw do
  resources :clients do
    resources :measurements do
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
