const appVariables = {
    API_URL: "http://localhost:8080",
    BASE_URL: "http://localhost:8080",
    IMG_URL: "http://localhost:8080",
    ALLOW_AUTHEN_SAML: "true",
    CHAT_URL: "",
    MULTI_LANGUAGES: ["EN","TH","VN"],
    BASE_CSS: "./css/theme_green_sea.css"
};
function getAppConfigs() {
    return appVariables;
}
function getAppConfig(key) {
    return appVariables[key];
}
console.log("appVariables",appVariables);
