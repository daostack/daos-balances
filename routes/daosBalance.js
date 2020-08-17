var express = require('express');
const fs = require('fs')
var router = express.Router();
const axios = require('axios');
const utils = require('../utils');
const {
  ALCHEMY_V1_SETTINGS_FILE_URL,
  ALCHEMY_V2_SETTINGS_FILE_URL,
  ETHPLORER_API_KEY,
  V1_NETWORKS,
  V2_NETWORKS,
  POLL_INTERVAL } = require('../constants');

let daosBalances = {
  v1: {},
  v2: {}
};

/**
* Given Alchemy version and network returns the DAOs from subgraph
* @param {string} version 
* @param {string} network 
*/
const fetchDaos = (version, network) => axios({
  url: require(`../alchemy-${version}-settings.json`)[network],
  method: 'POST',
  data: {
    query: `{
      daos { 
           id
           ${version === 'v2' ? "ethBalance" : ""}
      }
   }` }
}).then(res => {
  return res.data.data.daos;
});

/**
 * Given a DAO id, fetches tokens info from ethplorer
 * @param {string} id
 * @returns Token info of the DAO
 */
async function fetchDaoTokens(id) {
  return await axios({
    url: `https://api.ethplorer.io/getAddressInfo/${id}?apiKey=${ETHPLORER_API_KEY}`,
    method: 'GET'
  }).then(res => {
    return res.data;
  }).catch(err => {
    if (err.response) {
      // client received an error response (5xx, 4xx)
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    } else if (err.request) {
      // client never received a response, or request never left
      console.log(err.request);
    } else {
      // anything else
      console.log('Error', err.message);
    }
  })
}

/**
 * Given Alchemy version and netwrok, fetches the DAOs from subgraph and returns the balances
 * @param {string} version 
 * @param {string} network 
 */
async function fetchDaosBalances(version, network) {
  const daos = await fetchDaos(version, network);
  let daosBalanceData = [];

  for (const [index, dao] of daos.entries()) {
    await new Promise((resolve) => setTimeout(async () => {
      //console.log("dao number: ", index + 1, "/", daos.length);
      let daoBalanceData = await fetchDaoTokens(dao.id);

      // If there is ETH balance in the vault (v2), sum it to the total ETH balance.
      if (dao.ethBalance !== undefined) {
        daoBalanceData.ETH.balance += dao.ethBalance;
      }

      daosBalanceData.push(daoBalanceData);
      resolve();
    }, 0));
  }

  const daosTotalHoldings = daosBalanceData.map(daoBalanceData => {
    return { address: daoBalanceData.address, ...utils.calculateTotalHoldings(daoBalanceData) };
  });

  return daosTotalHoldings;
}

/**
 * Fetches Alchemy subgraph enpoints from GitHub for both v1/v2
 */
const fetchAlchemySettings = async () => {
  const alchemyV1SettingsFile = (await axios.get(ALCHEMY_V1_SETTINGS_FILE_URL)).data;
  fs.writeFileSync(
    './alchemy-v1-settings.json',
    JSON.stringify(alchemyV1SettingsFile),
    'utf-8'
  );
  const alchemyV2SettingsFile = (await axios.get(ALCHEMY_V2_SETTINGS_FILE_URL)).data;
  fs.writeFileSync(
    './alchemy-v2-settings.json',
    JSON.stringify(alchemyV2SettingsFile),
    'utf-8'
  );
}

const startFetching = async () => {
  await fetchAlchemySettings();
  for (network of V1_NETWORKS) {
    daosBalances.v1[network] = (await fetchDaosBalances('v1', network)).sort((a, b) => b.balance - a.balance);
  }

  for (network of V2_NETWORKS) {
    daosBalances.v2[network] = (await fetchDaosBalances('v2', network)).sort((a, b) => b.balance - a.balance);
  }
}

(async () => {
  await startFetching();
  setInterval(startFetching, POLL_INTERVAL);

  //console.log(daosBalances);

  /**
   * Route to get DAOs balances by Alchemy version, network and a range.
   * @example http://localhost:3001/daosBalance/getDaosBalances/?version=v2&network=http_kovan&from=0&to=10
   */
  router.get('/getDaosBalances/', (req, res, next) => {
    const { version, network, from, to } = req.query;
    res.send(daosBalances[version][network].slice(from, to));
  });

})();

module.exports = router;
