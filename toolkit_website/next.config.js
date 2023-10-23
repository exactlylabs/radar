const destination_base_url = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://pods.radartoolkit.com' : 'https://pods.staging.radartoolkit.com'
module.exports = {
  async redirects() {
    return [
      {
        source: '/TTUHSC',
        destination:  destination_base_url + '/TTUHSC',
        permanent: false,
      },
      {
        source: '/TTUHSC/:slug',
        destination: destination_base_url  + '/TTUHSC/:slug',
        permanent: false,
      },
    ]
  },
}