<template>
<div id="page_change" class="pt-page pt-page-current pt-page-controller" :class="{'forcer-page': isChanged}">
    <h1 class="page-header-title" title="page_change">{{ labels.changepassword_caption }}</h1>
    <div id="change_entrypanel">
        <div id="change_entrylayer" class="entry-layer">
            <div class="portal-area sub-entry-layer">
                <div class="row row-height" v-show="isChanged">
                    <div class="col-md-3 col-height col-label">&nbsp;</div>
                    <div class="col-md-7 col-height">
                        <label v-show="isForced">{{ labels.passwordforce_label }}</label>
                        <label v-show="isExpired">{{ labels.passwordexpire_label }}</label>
                    </div>
                </div>
                <div class="row row-height">
                    <div class="col-md-3 col-height col-label">
                        <label id="oldpassword_label" class="control-label" required="true">{{ labels.oldpassword_label }}</label>
                    </div>
                    <div class="col-md-4 col-height" :class="{'has-error': v$.oldpassword.$error}">
                        <div class="input-group">
                          <input v-model="localData.oldpassword" ref="oldpassword" type="password" class="form-control input-md alert-input" id="oldpassword" name="oldpassword" :placeholder="labels.oldpassword_label" autocomplete="off" size="8" />
                          <div class="input-group-append">
                            <a href="#0" class="btn btn-outline-secondarys btn-eye" ref="toggleoldpasswordbutton" @click="togglePassword($refs.toggleoldpasswordbutton, $refs.oldpassword, $refs.oldeyeslash)">
                              <i class="fa fa-eye-slash" ref="oldeyeslash"></i>
                            </a>
                          </div>
                        </div>
                        <span v-if="v$.oldpassword.$error" class="has-error">{{ v$.oldpassword.$errors[0].$message }}</span>
                    </div>
                </div>
                <div class="row row-height">
                    <div class="col-md-3 col-height col-label text-right">
                        <label id="userpassword_label" class="control-label" required="true">{{ labels.userpassword_label }}</label>
                    </div>
                    <div class="col-md-4 col-height" :class="{'has-error': v$.userpassword.$error}">
                        <div class="input-group">
                          <input v-model="localData.userpassword" ref="userpassword" type="password" class="form-control input-md alert-input" id="userpassword" name="userpassword" :placeholder="labels.userpassword_label" autocomplete="off" size="8" data-toggle="tooltip" title="Password can combine with alphabets and numeric sign not over 8 characters"/>
                          <div class="input-group-append">
                            <a href="#0" class="btn btn-outline-secondarys btn-eye" ref="toggleuserpasswordbutton" @click="togglePassword($refs.toggleuserpasswordbutton, $refs.userpassword, $refs.usereyeslash)">
                              <i class="fa fa-eye-slash" ref="usereyeslash"></i>
                            </a>
                          </div>
                        </div>
                        <span v-if="v$.userpassword.$error" class="has-error">{{ v$.userpassword.$errors[0].$message }}</span>
                    </div>
                </div>
                <div class="row row-height">
                    <div class="col-md-3 col-height col-label text-right">
                        <label id="confirmpassword_label" class="control-label" required="true">{{ labels.confirmpassword_label }}</label>
                    </div>
                    <div class="col-md-4 col-height" :class="{'has-error': v$.confirmpassword.$error}">
                        <div class="input-group">
                          <input v-model="localData.confirmpassword" ref="confirmpassword" type="password" class="form-control input-md alert-input" id="confirmpassword" name="confirmpassword" :placeholder="labels.confirmpassword_label" autocomplete="off" size="8" data-toggle="tooltip" title="Password can combine with alphabets and numeric sign not over 8 characters"/>
                          <div class="input-group-append">
                            <a href="#0" class="btn btn-outline-secondarys btn-eye" ref="toggleconfirmpasswordbutton" @click="togglePassword($refs.toggleconfirmpasswordbutton, $refs.confirmpassword, $refs.confirmeyeslash)">
                              <i class="fa fa-eye-slash" ref="confirmeyeslash"></i>
                            </a>
                          </div>
                        </div>
                        <span v-if="v$.confirmpassword.$error" class="has-error">{{ v$.confirmpassword.$errors[0].$message }}</span>
                    </div>
                </div>
                <div class="row row-height">
                    <div class="col-md-3 col-height col-label text-right"></div>
                    <div class="col-md-8 col-height" id="fspolicylayer">
                      <template v-for="(item,index) in policyLists" :key="index">
                        <span>{{ item }}</span><br/>
                      </template>
                    </div>
                </div>
                <div class="row row-height">
                    <div class="col-md-12 float-right pull-right text-right btn-ctrl-cover">
                        <button class="btn btn-dark btn-sm" @click.stop="saveClick"><em class="fa fa-save fa-btn-icon"></em> {{ labels.save_button }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<style>
.forcer-page { max-width: 95%; display: block; margin-left: auto; margin-right: auto; }
</style>
<script>
import $ from "jquery";
import { ref, computed, watch, onActivated } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, sameAs } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@willsofts/will-app';
import { startWaiting, stopWaiting, submitFailure, alertbox, serializeParameters, confirmSave, successbox }  from '@willsofts/will-app';
import { accessor } from "@/assets/js/accessor.js";
import { policies } from "@/assets/js/policies.js";

const formData = {
    oldpassword: '',
    userpassword: '',
    confirmpassword: '',
};

export default {
  props: {
    labels: Object,
    mode: {
      type: String,
      default: "",
    } ,   
  },
  emits: ["success"],
  setup(props,context) {
    let localData = ref({...formData});
    const reqalert = ref(props.labels.empty_alert);
    const matchalert = ref(props.labels.matchpassword_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const matchMessage = (matcher) => {
      return helpers.withMessage(matchalert, sameAs(matcher));
    }
    const validateRules = computed(() => { 
      return {
        oldpassword: { required: requiredMessage() },
        userpassword: { required: requiredMessage() },
        confirmpassword: { required: requiredMessage(), sameAs: matchMessage(localData.value.userpassword) },
      } 
    });
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    const onactivated = onActivated(() => {
      console.log("ChangeForm.vue: onActivated ... ");
      context.emit("activated","changepassword");
    });
    const changedMode = ref("");
    return { v$, accessor, policies, localData, reqalert, matchalert, onactivated, changedMode };
  },
  created() {
    watch(this.$props, (newProps) => {      
      this.reqalert = newProps.labels.empty_alert;
      this.matchalert = newProps.labels.matchpassword_alert;
    });
  },
  mounted() {
    console.log("ChangeForm.vue mounted ...");
    this.$nextTick(() => {
        this.setting();
    });
  },
  computed: {
    isChanged() { return this.changedMode != ""; },
    isForced() { return this.changedMode == 'force'; },
    isExpired() { return this.changedMode == 'expire'; },
    policyLists() {
      return  this.policies.getCategory(this.accessor.lang ?? "EN");
    },
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.v$.$reset();
    },
    setting() {
        console.log("ChangeForm.vue: setting ...");
        this.loadPolicies();
    },
    focus() {
      this.$refs.oldpassword.focus();
    },
    success() {
      this.$emit('success', 'changepassword', this.localData);
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
    loadPolicies() {
      console.log("ChangeForm.vue loadPolicies ...");
      if(!this.policies.isEmpty()) return;
      let formdata = serializeParameters({ajax: true},null,true);
      $.ajax({
          url: getApiUrl()+"/api/passwordpolicy/categories",
          data: formdata.jsondata,
          headers : formdata.headers,
          type: "POST",
          dataType: "json",
          contentType: DEFAULT_CONTENT_TYPE,
          success: (data,status,transport) => { 
              console.log("loadPolicies: success",transport.responseText);                
              if(data.body?.dataset) {
                  this.policies.setCategories(data.body.dataset);
              }                
          },
      });	
    },
    async saveClick() {
      console.log("click: save");
      let valid = await this.validateForm();
      if(!valid) return;
      this.startSaveRecord();
    },
    startSaveRecord() {
      confirmSave(() => { 
        this.saveRecord(this.localData);
      });
    },
    saveRecord(dataRecord) {
      let jsondata = {ajax: true, useruuid: this.accessor.info?.useruuid, userid: this.accessor.info?.userid};
      let formdata = serializeParameters(jsondata,dataRecord);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/password/change",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) { 
          submitFailure(transport,status,errorThrown,false);
        },
        success: (data,status,xhr) => { 
          console.log("saveRecord: success : ",xhr.responseText);
          stopWaiting();
          this.saveSuccess(data);
        }
      });			
    },
    saveSuccess(data) {
      console.log("saveSuccess : ",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        successbox(() => {
          this.success();
        });
      }			
    },
    display(mode="") {
      this.changedMode = mode;
      this.reset();
      this.focus();
      console.log("ChangeForm.vue: changedMode",this.changedMode);
    },
    togglePassword(toggleBtn,passwordField,icon) {
      if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    },
  },
};
</script>
