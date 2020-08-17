exports.ALCHEMY_V1_SETTINGS_FILE_URL = "https://raw.githubusercontent.com/daostack/alchemy/master/src/subgraph_endpoints.json";
exports.ALCHEMY_V2_SETTINGS_FILE_URL = "https://raw.githubusercontent.com/daostack/alchemy/dev-2/src/subgraph_endpoints.json";
exports.ETHPLORER_API_KEY = 'EK-uReqx-cB4r3E3-sfJSU';
exports.V1_NETWORKS = ['http_main', 'http_xdai'];
exports.V2_NETWORKS = ['http_rinkeby', 'http_ganache', 'http_kovan'];
exports.WEI = Math.pow(10,18);
exports.SI = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
];
exports.POLL_INTERVAL = 600000; // 10 minutes