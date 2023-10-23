module.exports = {
    async redirects() {
      return [
        {
          source: '/TTUHSC',
          destination: 'https://pods.radartoolkit.com/TTUHSC',
          permanent: false,
        },
        {
            source: '/TTUHSC/:slug',
            destination: 'https://pods.radartoolkit.com/TTUHSC/:slug',
            permanent: false,
          },
      ]
    },
  }