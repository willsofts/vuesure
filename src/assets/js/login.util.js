import $ from "jquery"
import { startWaiting, openNewWindow, submitWindow, closeChildWindows, getMultiLanguages }  from '@willsofts/will-app'
import { getApiUrl, getBaseUrl, getDefaultLanguage,  DEFAULT_CONTENT_TYPE, setMultiLanguages } from "@willsofts/will-app";
import { getAccessorToken, removeAccessorInfo, getAccessorInfo, saveAccessorInfo, getStorage, removeStorage, setupDiffie, setCurrentWindow } from "@willsofts/will-app";
import { setTokenKey, setApiUrl, setBaseUrl, setCdnUrl, setImgUrl, setDefaultLanguage, setApiToken, setBaseStorage, setSecureStorage, setBaseCss, setChatUrl } from "@willsofts/will-app";
import { getBaseStorage, isSecureStorage, getCdnUrl, getImgUrl, getBaseCss, getChatUrl, getDefaultRawParameters, setDefaultRawParameters, createLinkStyle } from "@willsofts/will-app";

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) { return false; }
}
export function openPage(app,accessor,favorite,callback) {
	return openProgram(app,accessor,favorite,callback);
}
const except_apps = ["page_profile","page_change","page_first","page_login","page_work","page_forgot","factor","page_register"];
export function openProgram(app,accessor,favorite,callback) {
	console.log("openProgram:",app);
	let fs_newwindows = "1" == accessor?.info?.newflag || "1" == app.newflag;
	let appid = app.programid;
	let url = app.url;
	let params = app.parameters;
	let apath = app.progpath;
	let appurl = getBaseUrl() + "/gui/" + appid;
	let html = false; 
	if(apath && apath.trim().length >0) {
		appurl = getBaseUrl() + apath;
		if(isValidUrl(apath)) {
			appurl = apath;
		}
		html = apath.indexOf(".html") > 0;
	}
	if(url && url.trim().length > 0) {
		//appurl = getBaseUrl()+"/load/"+appid; 
		appurl = url + "/" + appid;
		if(apath && apath.trim().length >0) {
			if(isValidUrl(apath)) {
				appurl = apath;
			} else {
				appurl = url + apath;
			}
		}
	}
	console.log("openProgram: app url",appurl);
	html = app.openmethod == "GET" ? "GET" : html;
	let authtoken = getAccessorToken();
	let awin;
	if(fs_newwindows) {
		awin = openNewWindow({
			method: html?"GET":"POST",
			url : appurl,
			windowName: "fs_window_"+appid,
			params: "seed="+Math.random()+"&authtoken="+authtoken+"&language="+getDefaultLanguage()+(params?"&"+params:"")
		});
		awin.focus();
	} else {
		$("#pagecontainer").hide();
		$("#workingframe").show();
		submitWindow({
			method: html?"GET":"POST",
			url : appurl,
			windowName: "workingframe",
			params: "seed="+Math.random()+"&authtoken="+authtoken+"&language="+getDefaultLanguage()+(params?"&"+params:"")
		});
		startWaiting();
	}
	setCurrentWindow(awin);
	recentApplication(app,favorite);
	if(callback) callback(awin);
	return awin;
}
function recentApplication(app,favorite) {
	if(!favorite) return;
	let appid = app.programid;
	if(favorite.recentlists.length > 12) return;
	if(except_apps.some((item) => item.programid == appid )) return;
	if(favorite.recentlists.some((item) => item.programid == appid )) return;
	favorite.recentlists.push({...app});
}
export function hideWorkSpace() {
	$("#workingframe").hide();
	window.open("./blank.html","workingframe");
} 
export function hideWorkingFrame() {
	hideWorkSpace();
}
export function forceLogout(info) {
	let useruuid = info?.useruuid;
	let authtoken = getAccessorToken();
	console.log("useruuid="+useruuid+", authtoken="+authtoken);
	$.ajax({ url : getApiUrl()+"/api/sign/signout", data: { useruuid: useruuid }, headers : { "authtoken": authtoken }, type : "POST" });
}
export function logOut(info) {
	forceLogout(info);
	doLogout();
}
export function doLogout() {
	removeAccessorInfo();
	doLogin();
	clearAvatar();
	closeChildWindows();
}
export function clearAvatar() {
	$("#avatarimage").addClass("img-avatar");
}
export function loggingIn() {
	hideWorkingFrame();
	$("#page_login").show();
}
export function doLogin() {
	loggingIn();
	hideWorkSpace();
	$("#languagemenuitem").addClass("language-menu-item").show();
	$("#recentmenulist").empty();
}		
export function refreshScreen() {
	$(window).trigger("resize");
}
export function validAccessToken(callback) {
	let json = getAccessorInfo();
	if(json && json.authtoken) {
		doAccessToken(json.authtoken,callback,json.info);
		return;
	}
	if(callback) callback(false);
}
export function doAccessToken(token,callback,info) {
	if(token && token.trim().length>0) {
		$.ajax({
			url: getApiUrl()+"/api/sign/accesstoken",
			headers : { "authtoken": token },
			type: "POST",
			contentType: DEFAULT_CONTENT_TYPE,
			dataType: "html",
			error : function() {
				if(callback) callback(false); 
			},
			success: function(data){ 
				accessSuccess(data,callback,info);
			}
		});	
		return;
	}		
	if(callback) callback(false); 
}
export function accessSuccess(data,callback,info) {
	console.log("accessSuccess : ",data);
	try {
		let json = JSON.parse(data);
		if(json && json.head.errorflag=="N") {
			if(info) json.body.info = info;
			console.log("accessSuccess: body",json.body);
			saveAccessorInfo(json.body);
			let accessToken = getStorage("access_token");
			if(accessToken) setupDiffie(json);
			removeStorage("access_token");
			if(callback) callback(true,json); 
			return;
		}
	} catch(ex) { console.error(ex); }
	if(callback) callback(false); 
}	
export function verifyAfterLogin(json,callback,accessor,favorite) {
	$("#fsworkinglayer").addClass("working-control-class");
	if(json.body.factorverify && json.body.factorid!="" && (json.body.factorcode==undefined || json.body.factorcode=="")) {
		$("#fsworkinglayer").removeClass("working-control-class");
		openPage({programid: "factor", parameters: "factorid="+json.body.factorid},accessor,favorite);
	} else {
		if(json.body.changeflag && json.body.changeflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage({programid: "page_change", parameters: "changed=force"},accessor,favorite);
		} else if(json.body.expireflag && json.body.expireflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage({programid: "page_change", parameters: "changed=expire"},accessor,favorite);
		} else {
			doAfterLogin(json,callback);
		}
	}
}
export function doAfterLogin(json,callback) {
	if(json) {
		let avatar = json.body.avatar;
		if(avatar && avatar.trim().length > 0) {
			$("#avatarimage").removeClass("img-avatar").attr("src",avatar);
		}
	}
	if(callback) callback();
}
export function loadAppConfig() {
	fetch("app.config.json").then(response => response.json()).then(data => {
		console.log("app.config.json",data);
		assignAppConfig(data);
	}).catch(err => console.error(err));
}
export function assignAppConfig(data,callback) {
	console.log("appConfig: data",data);
	if(!data) return;
	if(data.TOKEN_KEY !== undefined) setTokenKey(data.TOKEN_KEY);
	if(data.API_URL !== undefined) setApiUrl(data.API_URL);
	if(data.BASE_URL !== undefined) setBaseUrl(data.BASE_URL);
	if(data.CDN_URL !== undefined) setCdnUrl(data.CDN_URL);
	if(data.IMG_URL !== undefined) setImgUrl(data.IMG_URL);
	if(data.DEFAULT_LANGUAGE !== undefined) setDefaultLanguage(data.DEFAULT_LANGUAGE);
	if(data.API_TOKEN !== undefined) setApiToken(data.API_TOKEN);
	if(data.BASE_STORAGE !== undefined) setBaseStorage(data.BASE_STORAGE);
	if(data.SECURE_STORAGE !== undefined) setSecureStorage(data.SECURE_STORAGE);
	if(data.BASE_CSS !== undefined) setBaseCss(data.BASE_CSS);
	if(data.CHAT_URL !== undefined) setChatUrl(data.CHAT_URL);
	if(data.MULTI_LANGUAGES !== undefined) setMultiLanguages(data.MULTI_LANGUAGES);
	if(data.DEFAULT_RAW_PARAMETERS !== undefined) setDefaultRawParameters(data.DEFAULT_RAW_PARAMETERS);
	console.info("appConfig: DEFAULT_LANGUAGE="+getDefaultLanguage(),", BASE_STORAGE="+getBaseStorage(),", DEFAULT_RAW_PARAMETERS="+getDefaultRawParameters(),", SECURE_STORAGE="+isSecureStorage());
	console.info("appConfig: API_URL="+getApiUrl(),", BASE_URL="+getBaseUrl(),", CDN_URL="+getCdnUrl(),", IMG_URL="+getImgUrl()+", BASE_CSS="+getBaseCss()+", CHAT_URL="+getChatUrl()+", MULTI_LANGUAGES="+getMultiLanguages());
	createLinkStyle(getBaseCss());
	if(callback) callback(data);
}
export function initAppConfig(callback) {
	try {
		assignAppConfig(window.getAppConfigs(),callback);
	} catch(ex) { console.error(ex); }
}
