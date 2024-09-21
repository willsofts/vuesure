import $ from "jquery"
import io from "socket.io-client";
import { getChatUrl } from "@willsofts/will-app";
import { openPage } from "./login.util";

let socket = null;
export function startReceiveBroadcast(chat_url) {
    if(!chat_url) chat_url = getChatUrl();
    console.log("start receive bc: ",chat_url);
    if(chat_url && chat_url.trim().length > 0) {
        socket = io(chat_url);
        socket.on('broadcast-message', function(msg) {
            console.log("broadcast-message:",msg);
            if(msg.type == "bc") {
                let div = $("<div class='bc-layer'></div>");
                let link = $("<a href=\"javascript:void(0)\" class=\"bc-close\" aria-label=\"close\"></a>").html("<em class='fa fa-close'></em>");
                link.on("click",() => { div.remove(); });
                let span = $("<span></span>").html(msg.message);
                let body = $("body");
                let isz = body.find("div.bc-layer").length;
                if(isz > 0 && isz < 10) {
                    let bottom = isz * 50;
                    div.css({bottom: bottom});
                }
                div.append(link).append(span).appendTo(body);
            } else if(msg.type == "app" && msg.app) {
                //try support open app directly
                //app info = { programid: "?", url: "?", parameters: "?", progpath: "?" }
                let div = $("<div class='bc-layer'></div>");
                let link = $("<a href=\"javascript:void(0)\" class=\"bc-close\" aria-label=\"close\"></a>").html("<em class='fa fa-close'></em>");
                link.on("click",() => { div.remove(); });
                let alink = $("<a href=\"javascript:void(0)\" class=\"app-text\"></a>").html(msg.message);
                alink.on("click",() => { openPage(msg.app); link.trigger("click"); });
                let span = $("<span></span>").append(alink);
                let body = $("body");
                let isz = body.find("div.bc-layer").length;
                if(isz > 0 && isz < 10) {
                    let bottom = isz * 50;
                    div.css({bottom: bottom});
                }
                div.append(link).append(span).appendTo(body);                
            }
        });
    }
}
export function stopReceiveBroadcast() {
    if(socket) socket.disconnect();
}
