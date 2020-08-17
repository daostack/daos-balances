const { WEI, SI } = require('./constants');

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
        tokenBalance += (balance * rate) / WEI;
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
    if (Number.isInteger(parseFloat(balance))) {
        balance = balance / WEI;
    }
    return balance * rate;
}

/**
 * Given number and precision returns a formatted string with the requested precision.
 * @param {number} num 
 * @param {number} digits
 * @returns {string} Formatted string
 */
const numberFormatter = (num, digits) => {
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = SI.length - 1; i > 0; i--) {
        if (num >= SI[i].value) {
            break;
        }
    }
    return (num / SI[i].value).toFixed(digits).replace(rx, "$1") + SI[i].symbol;
}

/**
 * Given DAO balance data (ETH + tokens) returns the total balance and formatted balance in USD.
 * @param {*} daoBalanceData
 * @returns {object} DAO total holdings (balance and formatted balance) in USD
 */
module.exports.calculateTotalHoldings = daoBalanceData => {
    const ethBalance = calculateEthBalance(daoBalanceData.ETH);
    const tokensBalance = daoBalanceData.tokens ? calculateTokensBalance(daoBalanceData.tokens) : 0;
    return { balance: (ethBalance + tokensBalance).toFixed(2), formattedBalance: numberFormatter(ethBalance + tokensBalance, 2) };
}
