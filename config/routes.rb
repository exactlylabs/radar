Rails.application.routes.draw do
  resources :clients do
    resources :measurements

    member do
      post 'claim'
      post 'release'
      get 'configuration'
    end
  end

  devise_for :users
  
  root to: 'home#home'
end
