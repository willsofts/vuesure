import { getDefaultLanguage } from "./appinfo";

import messages from '../json/smart_message.json';

export function getMessageCode(errcode, params, defaultMessage) {
    if(errcode && errcode.trim().length>0) {
        let lang = getDefaultLanguage();
        if(!lang || lang.trim().length==0) lang = "EN";
		let msg = messages.find((item) => { return item.code == errcode; });
		if(msg) {
			let text = msg[lang];
			if(text && text.trim().length>0) {
				return replaceString(text, params);
			}
		}
    }
	return defaultMessage?defaultMessage:errcode;
}

export function replaceString(str, arrStr){                           	
	if(arrStr) {
		let regex = /%s/;
		for(let i=0;i<arrStr.length;i++){
			let t_str = arrStr[i];
			str = str.replace(regex, t_str);
		}
	} 
	if(str) {
		let regex = /%s/g;
		str = str.replace(regex,"");
	}
	return str;
}
