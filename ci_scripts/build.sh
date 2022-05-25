cd agent
echo -n $PROVIDER_SIGNING_CERT | base64 -d > binCert.crt
echo -n $PROVIDER_SIGNING_KEY | base64 -d > binKey.key
echo -n $ROOT_CA | base64 -d > internal/update/rootCA.pem
./scripts/build_and_sign.sh \
            --os $OS \
            --arch $ARCH \
            -o dist/$BIN_NAME \
            $VERSION binCert.crt binKey.key
