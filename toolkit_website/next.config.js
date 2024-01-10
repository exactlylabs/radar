const DESTINATION_BASE_URL = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://pods.radartoolkit.com' : 'https://pods.staging.radartoolkit.com'
module.exports = {
  async redirects() {
    return [
      {
        source: '/TTUHSC',
        destination:  DESTINATION_BASE_URL + '/TTUHSC',
        permanent: false,
      },
      {
        source: '/TTUHSC/:slug',
        destination: DESTINATION_BASE_URL  + '/TTUHSC/:slug',
        permanent: false,
      },
      {
        source: '/WestVirginiaPCA',
        destination: 'https://www.wvpca.org/content.asp?contentid=253',
        permanent: false,
      },
      {
        source: '/Alaska',
        destination: '/',
        permanent: false,
      }
    ]
  },
}