const config = require('../../../../config')
const axios = require('axios');
//const authConfig = (await axios.get("http://localhost:12345/data-model-mapper-gui/assets/config.json")).data
const authConfig = config.authConfig
const keycloakServerURL = authConfig.idmHost;
const realm = authConfig.authRealm;
const clientID = authConfig.clientId;
const clientSecret = authConfig.secret;

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

module.exports = {
    auth: async (req, res, next) => {

        if (authConfig.disableAuth)
            next()
        else {
            const authHeader = req.headers.authorization;

            if (authHeader) {
                const jwtToken = authHeader.split(' ')[1];

                if (authConfig.introspect) {
                    const introspectionEndpoint = `${keycloakServerURL}/realms/${realm}/protocol/openid-connect/token/introspect`;

                    const data = new URLSearchParams();
                    data.append('token', jwtToken);
                    data.append('client_id', clientID);
                    data.append('client_secret', clientSecret);

                    axios.post(introspectionEndpoint, data)
                        .then(response => {
                            if (response.data.active) {
                                console.log('Token valid:', response.data);
                                next();
                            } else {
                                console.log('Token not valid.');
                                res.sendStatus(403);
                            }
                        })
                        .catch(error => {
                            console.log(error.response.data)
                            console.error('Errore during token verify:', error.message);
                            res.sendStatus(500);
                        });
                }
                else {

                    const decodedToken = parseJwt(jwtToken)

                    if ((decodedToken.azp == authConfig.clientId) && ((decodedToken.exp * 1000) > Date.now()))
                        next()
                    else
                        res.sendStatus(403);
                }
            }
            else
                res.sendStatus(401);
        }
    }
};