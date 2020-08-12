const { WEI } = require('./constants');

/**
 * Given tokens data returns the tokens balance in USD
 * @param {*} tokensData
 * @returns {number} Tokens balance in USD
 */
const calculateTokensBalance = tokensData => {
    let tokenBalance = 0;
    tokensData.forEach(token => {
        const balance = isNaN(token.balance) ? 0 : token.balance;
        const rate = isNaN(token.tokenInfo.price.rate) ? 0 : token.tokenInfo.price.rate;
        tokenBalance += ( balance * rate ) / WEI;
    });
    return tokenBalance;
}

/**
 * Given ETH data returns ETH balance in USD
 * @param {*} ethData 
 * @returns {number} ETH balance in USD
 */
const calculateEthBalance = ethData => {
    let balance = isNaN(ethData.balance) ? 0 : ethData.balance;
    const rate = isNaN(ethData.price.rate) ? 0 : ethData.price.rate;

    // Some balances are in WEI (string) and some are floating points.
    // If it's WEI, convert to floating point number.
    if (Number.isInteger(parseFloat(balance))){
        balance = balance / WEI;
    }
    return balance * rate;
}


/**
 * Given DAO balance data (ETH + tokens) returns the total amount in USD
 * @param {*} daoBalanceData
 * @returns {string} DAO total holdings in USD
 */
module.exports.calculateTotalHoldings = daoBalanceData => {
    const ethBalance = calculateEthBalance(daoBalanceData.ETH);
    const tokensBalance = daoBalanceData.tokens ? calculateTokensBalance(daoBalanceData.tokens) : 0;
    return (ethBalance + tokensBalance).toFixed(2);
}
