<template>
<nav ref="navigatebar" id="navigatebar" class="navbar navbar-expand navigatebar-top" v-show="visible">
    <div id="leftmenucontainer" class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
            <li id="mainmenu" class="nav-item active">
                <a href="javascript:void(0)" @click="menuSelected('menu')" id="mainmenutrigger" class="nav-link" data-toggle="dropdown" title="Menu"><em class="fa fa-bars"></em></a>
            </li>
            <li id="homelayer" class="nav-item">
                <a href="javascript:void(0)" @click="menuSelected('home')" id="homemenutrigger" class="nav-link" title="Home"><em class="fa fa-home"></em></a>		
            </li>	
            <li id="productlayer" class="nav-item">
                <a href="javascript:void(0)" @click="menuSelected('intro')" id="intromenutrigger" class="nav-link" title="Welcome"><img id="productimage" src="../../assets/img/app_logo.png" width="40" height="40" alt="" /></a>		
            </li>				
            <li id="productlayer" class="nav-item dropdown" >
                <a href="javascript:void(0)" id="recentmenutrigger" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="History">
                    <span id="programtitle">{{ labels.system_label }}</span>
                    <span id="recentcaret" class="fa fa-caret-down caret-down"></span>
                </a>
                <RecentMenu ref="recentMenu" />
            </li>						
        </ul>				
    </div>
    <div id="rightmenucontainer" class="navbar-nav navbar-collapse">
        <ul id="navmenuitem" class="navbar-expand nav navbar-nav navbar-right navbar-user ml-auto">							
            <li id="usermenuitem" class="nav-item dropdown user-dropdown">
                <a href="javascript:void(0)" id="accessor_linker" class="nav-link dropdown-item dropdown-toggle" role="button" data-toggle="dropdown" title="My Information">
                    <span id="accessor_label">{{ accessorFullName }}</span>
                    <strong class="fa fa-caret-down caret-down"></strong>
                </a>
                <ul id="userinfoitemlist" class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <li><a href="javascript:void(0)" class="dropdown-item accessor-access" id="accessor_access_link" title="Last Access"><em class="fa fa-clock-o"></em><span id="last_access_label" class="menu-span">{{ lastAccessTime }} </span></a></li>						
                    <li class="dropdown-divider divider"></li>
                    <li><a href="javascript:void(0)" @click="menuSelected('profile')" class="dropdown-item" id="accessor_profile_link"><em class="fa fa-user"></em><span id="profile_label" class="menu-span">{{ labels.profile_label }}</span></a></li>
                    <li id="userchangeitem"><a href="javascript:void(0)" @click="menuSelected('changepassword')" class="dropdown-item" id="accessor_change_link"><em class="fa fa-lock"></em><span id="changepwd_label" class="menu-span"> {{ labels.changepwd_label }}</span></a></li>
                    <li class="dropdown-divider divider"></li>
                    <li><a href="javascript:void(0)" @click="menuSelected('logout')" class="dropdown-item" id="accessor_logout_link"><em class="fa fa-power-off"></em><span id="logout_label" class="menu-span"> {{ labels.logout_label }}</span></a></li>
                </ul>
            </li>	
        </ul>
        <ul class="navbar-expand nav navbar-nav navbar-right navbar-user-avatar">
            <li id="avatarmenuitem" class="nav-item avatar-menu-item">
                <a href="javascript:void(0)" id="avatarmenuitemlink" class="nav-link dropdown-toggle avatar-item" data-toggle="dropdown" data-target="#usermenuitem"><img id="avatarimage" width="50" height="50" class="img-avatar img-circle rounded-circle"/></a>
            </li>                
            <li id="languagemenuitem" class="nav-item dropdown user-dropdown" v-show="languageVisible">
                <a href="javascript:void(0)" id="languagemenuitemlink" class="nav-link dropdown-item dropdown-toggle" data-toggle="dropdown">	
                    <img id="languageimage" alt="Language" title="Language" class="img-lang" :class="'img-lang-'+accessor.lang" />
                    <strong class="fa fa-caret-down caret-down"></strong>
                </a>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li v-for="item in multiLanguages" :key="item.lang">
                        <a href="javascript:void(0)" @click="changeLanguage(item.lang)" class="dropdown-item"><img class="img-lang" :class="'img-lang-' + item.lang" /><span class="lang-word">{{ labels[item.label] }}</span></a>
                    </li>
                </ul>
            </li>
            <FavorMenu ref="favorMenu" :visible="favorVisible" />
        </ul>
    </div>
</nav>
<SiderBar ref="siderBar" :visible="visible" :labels="labels" />
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import SiderBar from "./SiderBar.vue";
import FavorMenu from "./FavorMenu.vue";
import RecentMenu from "./RecentMenu.vue";
import { setDefaultLanguage, getMultiLanguagesModel, registerNotification } from "@willsofts/will-app";
import { DEFAULT_CONTENT_TYPE, getImgUrl, getApiUrl, getAccessorToken, sendMessageToFrame } from "@willsofts/will-app";
import { accessor } from "@/assets/js/accessor.js";

export default {
  components: { SiderBar, FavorMenu, RecentMenu },    
  props: {
    labels: Object,    
    visible: {
      type: [String,Boolean],
      default: true,
    },
  },
  emits: ["language-changed","menu-selected"],
  setup() {
    const languageVisible = ref(true);
    const favorVisible = ref(true);
    const multiLanguages = ref(getMultiLanguagesModel());
    return { accessor, languageVisible, favorVisible, multiLanguages };
  },
  created() {
    registerNotification((action,data) => {
        console.log("registerNotification: "+action,data);
        if("multi-languages"==action) {
            this.multiLanguages = getMultiLanguagesModel(data);
        }
    });
  },
  computed: {
    accessorFullName() { 
        if(this.accessor.info?.displayname && this.accessor.info?.displayname.trim().length > 0) return this.accessor.info?.displayname;
        if(this.accessor.info?.name && this.accessor.info?.surname) return this.accessor.info?.name+" "+this.accessor.info?.surname;
        return this.accessor.info?.username ? this.accessor.info?.username : ""; 
    },
    lastAccessTime() { return this.accessor.info?.accessdate && this.accessor.info?.accesstime ? this.accessor.info?.accessdate+" "+this.accessor.info?.accesstime : ""; },
  },
  methods: {
    reset() {
        console.log("HeaderVar.vue: reset ...");
        this.$refs.favorMenu.reset();
        this.$refs.siderBar.reset();
        this.clearAvatar();
    },
    menuSelected(menu) {
        if("menu"==menu) { this.$refs.siderBar.displaySideBarMenu(); }
        this.$emit("menu-selected", menu);
	},
    changeLanguage(lang) {
        console.log("change language: ",lang);
        setDefaultLanguage(lang);
        this.accessor.lang = lang;
        this.$refs.siderBar.changeLanguage(lang);
        this.$emit('language-changed', lang);
        sendMessageToFrame({type:"language",language:lang});
    },
    setting(callback) {
        console.log("HeaderBar: setting, accessor",this.accessor);
        let avatar = this.accessor.info?.avatar;
        if(avatar && avatar.trim().length > 0) {
            this.showAvatar(avatar);
        } else {
            this.fetchAvatar(this.accessor.info?.userid,this.accessor.info?.photoimage);
        }
        this.$refs.favorMenu.setting();
        this.$refs.siderBar.setting(callback);
        this.$refs.siderBar.show();
    },
    clearAvatar() {
        $("#avatarimage").attr("src","");
        $("#avatarimage").addClass("img-avatar");
    },
    showAvatar(avatar) {
        if(avatar && avatar.trim().length > 0) {
            let data = avatar.indexOf("data:") >= 0;
            $("#avatarimage").removeClass("img-avatar");
            $("#avatarimage").attr("src",data ? avatar : getImgUrl()+avatar);
        }
    },
    fetchAvatar(userid,photoimage) {
        let authtoken = getAccessorToken();
        console.log("fetchAvatar: userid="+userid);
        $.ajax({ 
            url : getApiUrl()+"/api/avatar/image", 
            data: JSON.stringify({ userid: userid, photoimage: photoimage }), 
            headers : { "authtoken": authtoken }, 
            type : "POST",
            dataType: "json",
            contentType: DEFAULT_CONTENT_TYPE,
            success: (data) => { 
                this.showAvatar(data?.avatar);
            }
        });
    },
    showLanguage() { this.languageVisible = true; },
    hideLanguage() { this.languageVisible = false; },
    showFavorite() { this.favorVisible = true; },
    hideFavorite() { this.favorVisible = false; },
    displaySideBar() { this.$refs.siderBar.displaySideBarMenu(); },    
    collapseSideBar() { this.$refs.siderBar.collapseSideBarMenu(); },
  },
};
</script>
