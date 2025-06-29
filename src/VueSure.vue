<!-- App.vue -->
<template>
  <div id="fswaitlayer" class="fa fa-spinner fa-spin"></div>
  <div id="mainlayer" ref="mainlayer" v-show="isShowing == true">
    <HeaderBar ref="headerBar" :visible="menuVisible" :labels="labels" @language-changed="changeLanguage" @menu-selected="menuSelected" />
    <LoginForm ref="loginForm" :visible="loginVisible" :labels="labels" version="v1.0.0" @success="loginSuccess" @forgot="forgotPassword" />
    <WorkerFrame ref="workerFrame" :visible="workingVisible" :labels="labels" />
  </div>
  <div id="forcelayer" ref="forcelayer" v-show="isShowing == false">
    <keep-alive>
      <component :is="currentForcePage" ref="forceComponent" :labels="labels" @activated="componentActivated" @success="processSuccess" />
    </keep-alive>
  </div>
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { startApplication }  from '@willsofts/will-app';
import { getLabelModel, loadAndMergeLabel, getDefaultLanguage, getMetaInfo } from "@willsofts/will-app";
import { refreshScreen, logOut, validAccessToken, openPage } from "@/assets/js/login.util.js";
import { removeAccessorInfo } from "@willsofts/will-app";
import { accessor } from "@/assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";
import { isSSOSignedIn, doSSOLogout } from "@/assets/js/auth.js";
import { startReceiveBroadcast, stopReceiveBroadcast } from "@/assets/js/bc.js";
import HeaderBar from "./components/menu/HeaderBar.vue";
import LoginForm from "./components/form/LoginForm.vue";
import WorkerFrame from "./components/WorkerFrame.vue";
import BlankForm from "./components/form/BlankForm.vue";
import ChangeForm from "./components/form/ChangeForm.vue";
import ForgotForm from "./components/form/ForgotForm.vue";
import FactorForm from "./components/form/FactorForm.vue";

export default {
  components: {
    HeaderBar, LoginForm, WorkerFrame, BlankForm, ChangeForm, ForgotForm, FactorForm
  },
  setup() {
    let labels = ref(getLabelModel());
    let isShowing = ref(true);
    let loginVisible = ref(false);
    let menuVisible = ref(false);
    let workingVisible = ref(false);
    let currentForcePage = ref("BlankForm");
    let mode = ref("");
    return { labels, accessor, favorite, isShowing, loginVisible, menuVisible, workingVisible, currentForcePage, mode };
  },
  mounted() {
    console.log("App: on mounted ...");
    this.$nextTick(() => {
      startApplication("index");
			validAccessToken((valid,json) => {
				console.log("valid :",valid,", json :",json);
				if(!valid) {
					removeAccessorInfo();
          this.loginVisible = true;
          setTimeout(() => { this.$refs.loginForm.focus(); },5);          
				} else {
					this.verifyAfterLogin(json.body);
				}
			});
      /**
       * This try to load label and message code from server (api label & msgcode)
       * in case of server except authorize label & msgcode service 
       * then define default.js with META_INFO.ALLOW_LOAD_LABEL = true too       
       * in the other way this will load label after login success
       * */ 
      if(String(getMetaInfo().ALLOW_LOAD_LABEL)=="true") {
        this.loadLabel();
      }
    });
  },
  methods: {
    changeLanguage(lang) {
      let labelModel = getLabelModel(lang);
      this.labels = labelModel;
    },
    loadLabel() {
      loadAndMergeLabel("vindex", (success) => {
        if (success) {
          this.changeLanguage(getDefaultLanguage());
        }
      });
    },
    verifyAfterLogin(body) {
      console.log("verifyAfterLogin: body",body);
      this.setAccessInfo(body);
      if(body?.factorverify && body?.factorid!="" && (body?.factorcode==undefined || body?.factorcode=="")) {
        console.log("two factor ...");
        this.isShowing = false;
        this.mode = "factor";
        this.currentForcePage = FactorForm;
      } else {
        this.verifyForcePage(body);
      }
      this.loadLabel();
    },
    verifyForcePage(body) {
      if(body?.changeflag=="1") {
          console.log("force change password ...");
          this.isShowing = false;
          this.mode = "force";
          this.currentForcePage = ChangeForm;
        } else if(body?.expireflag=="1") {
          console.log("password expired ...");
          this.isShowing = false;
          this.mode = "expire";
          this.currentForcePage = ChangeForm;
        } else {
          this.displayMenu();
          startReceiveBroadcast();
        }
    },
    setAccessInfo(info) {
      this.accessor.setInfo(info);      
      if(this.accessor.info?.langcode && this.accessor.info?.langcode.trim().length > 0) {
        this.$refs.headerBar.changeLanguage(this.accessor.info?.langcode);
      }
    },
    loginSuccess(info) {
      console.log("login success: info",info);
      this.verifyAfterLogin(info);
    },
    displayMenu() {
      $(window.document.body).removeClass("body-login");
      this.mode = "";
      this.currentForcePage = BlankForm;
      this.isShowing = true;
      this.loginVisible = false;
      this.menuVisible = true;
      this.$refs.headerBar.setting((menulists) => { this.openFistPage(menulists); });
      this.$refs.workerFrame.setting();
      refreshScreen();
    },
    menuSelected(menu) {
      console.log("App.vue: menu selected:",menu);
      if("logout"==menu) { this.goLogOut(); }
      else if("home"==menu) { this.goHome(); }
      else if("intro"==menu) { this.$refs.workerFrame.hideWorkerMenu(); }
      else if("profile"==menu) { this.$refs.workerFrame.showProfile(); }
      else if("changepassword"==menu) { this.$refs.workerFrame.showChangePassword(); }
    },
    goHome() {
      this.workingVisible = false;
      this.$refs.headerBar.showLanguage();
      this.$refs.workerFrame.showWorkerMenu();
    },
    goLogOut() {
      $(window.document.body).addClass("body-login");
      logOut({...this.accessor.info});
      this.$refs.workerFrame.reset();
      this.$refs.headerBar.reset();
      this.$refs.loginForm.reset();
      this.$refs.loginForm.focus();
      this.loginVisible = true;
      this.menuVisible = false;
      this.accessor.reset();
      if(isSSOSignedIn()) {
        doSSOLogout();
      }
      stopReceiveBroadcast();
    },
    goLogIn() {
      $(window.document.body).addClass("body-login");
      this.isShowing = true;
      this.mode = "";
      this.currentForcePage = BlankForm;
    },
    openFistPage(menulists) {
      let page = this.accessor.info?.firstpage || "worklist";
      console.log("openFirstPage:",page);
      if(menulists && (page && page.trim().length > 0)) {
        let prog = menulists.find((item) => item.element.programid == page );
        if(prog) {
          openPage(prog.element,this.accessor,this.favorite);
        }
      }
    },
    hideMenu() {
      this.$refs.headerBar.collapseSideBar();
    },
    componentActivated(name) {
      console.log("component activated: ",name);
      if("changepassword"==name) this.$refs.forceComponent.display(this.mode);
      else if("forgot"==name) this.$refs.forceComponent.display(this.mode);
      else if("factor"==name) this.$refs.forceComponent.display(this.mode);
    },
    processSuccess(action,info) {
      console.log("processSuccess: action",action,", info",info);
      if("changepassword"==action) {
        this.displayMenu();
      } else if("factor"==action) {
        this.verifyForcePage(this.accessor.info);
      }
    },
    forgotPassword() {
      console.log("forgot password click ...");
      this.isShowing = false;
      this.mode = "forgot";
      this.currentForcePage = ForgotForm;
    },
  }
};
</script>