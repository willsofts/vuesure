<template>
<div id="page_login" v-show="visible">
  <div id="div-login-container">
		<div class="div-login-left div-login-column">
			<div class="div-login-frame shadow-animate">
				<div class="div-login-shape">
					<div id="login_logo_label">
						<span class="pass-word">Pass</span>
						&amp;
						<span class="go-word">Go</span>
						<hr class="login-hr-line"/>
					</div>
				</div>
			</div>
		</div>
		<div class="div-login-right div-login-column" :class="{'div-login-right-center' : !hasSSO}">
			<div id="div-login-input">			
        <div id="pager_login" class="pt-page pt-page-current">
          <div id="page_login_area">
            <div id="page_login_entry" class="page-login-entry">
              <input type="hidden" id="main_useruuid" />
              <div class="main-form" id="main_form" name="main_form">
                <div id="loginformlayer" class="login_form login-portal-area">
                  <br/>     
                  <label id="login_label" class="login-label">{{ labels.login_label }}</label>   
                  <br/>  
                  <div class="input-group-name login-input-field">
                      <i class="fa fa-user login-icon"></i>
                      <input ref="main_username" type="text" v-model="localData.username" id="main_username" name="username" class="form-control input-md" maxlength="60" required />
                      <label id="login_user_label" class="login-label">{{ labels.username_label }}</label>
                      <span v-if="v$.username.$error" class="has-error">{{ v$.username.$errors[0].$message }}</span>
                  </div>
                  <br/>
                  <div class="input-group-password login-input-field">
                      <i class="fa fa-lock login-icon"></i>
                      <input ref="main_pass" type="password" v-model="localData.password" id="main_pass" name="password" class="form-control input-md" autocomplete="off" required />
                      <label id="login_password_label" class="login-label">{{ labels.password_label }}</label>
                      <span v-if="v$.password.$error" class="has-error">{{ v$.password.$errors[0].$message }}</span>
                  </div>
                  <br/>
                  <div class="input-group-forgot"> 
                      <a href="javascript:void(0)" id="forgot_password" class="enter-class login-label" title="Forgot Password" @click="$emit('forgot')">{{ labels.forgot_label }}</a>
                  </div>
                  <br/>										
                  <div id="login_button_layer" class="login_button_layer">
                      <button id="main_button" class="form-control input-md" @click="loginClick">{{ labels.signin_label }}</button>
                  </div>
                  <br/>
                  <div class="row">
                      <div class="col-md-12 text-center">
                          <label class="login-label">{{ version }}</label>
                      </div>
                  </div>
                  <SSOPanel ref="ssoPanel" :labels="labels" @sso-selected="ssoSelected" @sso-setting="ssoSetting"/>
                  <br/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import $ from "jquery";
import { ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@willsofts/will-app';
import { startWaiting, stopWaiting, submitFailure, alertbox }  from '@willsofts/will-app';
import { saveAccessorInfo, setupDiffie } from "@willsofts/will-app";
import { startSSO } from "@/assets/js/auth.js";
import SSOPanel from "./SSOPanel.vue";

const formData = {
    username: '',
    password: '',
};

export default {
  components: { SSOPanel },
  props: {
    labels: Object,    
    version: {
        type: String,
        required: false,
        default: "v1.0.0",
    },
    visible: {
      type: [String,Boolean],
      default: true,
    }
  },
  emits: ["success","forgot"],
  setup(props) {
    let localInfo = ref({});
    let localData = ref({...formData});
    const reqalert = ref(props.labels.empty_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const validateRules = computed(() => { 
      return {
        username: { required: requiredMessage() },
        password: { required: requiredMessage() },
      } 
    });
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    const hasSSO = ref(true);
    return { v$, localInfo, localData, reqalert, hasSSO };
  },
  mounted() {
    this.$nextTick(() => {
      $(this.$refs.main_pass).on("keydown", (e) => {
        if(e.which==13) { this.connectServer(); }
      });
    });
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.v$.$reset();
    },
    focus() {
      this.$refs.main_username.focus();
    },
    success() {
      this.$emit('success', this.localInfo);
    },
    async validateForm(focusing=true) {
      const valid = await this.v$.$validate();
      if(!valid) {
        if(focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if(this.v$.$errors && this.v$.$errors.length > 0) {
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if(el) el.focus();
      }
    },
    loginClick() {
      this.connectServer();
    },
    async connectServer() {
      let valid = await this.validateForm();
      if(!valid) return;
      this.startLogin();
    },
    startLogin() {
      let params = {...this.localData};
      console.log("startLogin: params",params);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/sign/signin",
        type: "POST",
        contentType: DEFAULT_CONTENT_TYPE,
        data: JSON.stringify(params), 
        dataType: "json",
        error : function(transport,status,errorThrown) {
          submitFailure(transport,status,errorThrown,false); 
        },
        success: (data,status,xhr) => { 
          console.log("startLogin: responseText",xhr.responseText);
          stopWaiting();
          this.loginSuccess(data);
        }
      });			
    },
    loginSuccess(data) {
      console.log("loginSuccess: data",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        this.localInfo = {...data.body};
        saveAccessorInfo(data.body);
        setupDiffie(data);
        this.success();
      }			
    },
    ssoSelected(item) {
      console.log("LoginForm.vue: sso-seleced",item);
      startSSO(item.domainid,(data) => {
        console.log("SSO: data",data); 
        this.loginSuccess(data);
      });
    },
    ssoSetting(lists) {
      this.hasSSO = lists.length > 0;
    },
  }
};
</script>
