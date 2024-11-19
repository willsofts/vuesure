<template>
<ul id="menuitemlist" class="nav flex-column sidebar-nav navbar-nav list-sidebar bg-default" role="menu">
    <li class="dropdown" v-for="(value,key,counter) in menus.sidemap" :key="key">
        <a @click="$emit('group-menu-selected', value)" class="nav-menu-group dropdown-toggle collapsed active" data-toggle="collapse" :data-target="'#submenu_'+counter" href="javascript:void(0);">
            <em :class="getDisplayGroupStyle(value)"></em>&nbsp;
            <span class="nav-label">{{ getDisplayGroupName(value) }}</span>
            <span class="menu-group-icon fa fa-chevron-left pull-right"></span>
        </a>
        <ul :id="'submenu_'+counter" class="sub-menu panel-collapse collapse" role="menu">
            <template v-if="hasMenuTree(value)">
                <template v-for="(menu,index) in value.jsonmenu.items" :key="index">
                    <SiderMenuTree :menu="menu" @menu-selected="menuSelected" :menuId="getMenuId()"/>
                </template>
            </template>
            <template v-else>
                <li v-for="(item,index) in menus.sidelist[key]" :key="index">
                    <a href="javascript:void(0);" @click="itemMenuSelected(item)" class="fa-link-menu-item menu-desktop" :class="item.iconstyle" :data-pid="item.programid" :data-url="item.url" :title="item.programid">{{ getDisplayProgramName(item) }}</a>
                </li>
            </template>
        </ul>
    </li>
</ul>
</template>
<script>
import { randomNumber } from "@willsofts/will-app";
import SiderMenuTree from "./SiderMenuTree.vue";
export default {
    components: { SiderMenuTree },
  props: {
    menus: Object,    
    metas: Object,
    lang: String,
  },
  emits: ["group-menu-selected","item-menu-selected"],
  methods: {
    getDisplayGroupStyle(item) {
        return item.groupstyle && item.groupstyle.trim().length > 0 ? item.groupstyle : "fa fa-tasks";
    },
    getDisplayGroupName(item) {
        return this.$props.lang === 'TH' ? item.nameth : item.nameen;
    },
    getDisplayProgramName(item) {
        return this.$props.lang === 'TH' ? item.prognameth : item.progname;
    },
    itemMenuSelected(item) {
        console.log("SideMenu.vue: menu item selected",item);
        this.$emit("item-menu-selected", item);
    },
    getMenuId() { return randomNumber()+"_"+new Date().getTime(); },
    isMenuTree() { 
        return this.$props.metas.MENU_TREE; 
    },
    hasMenuTree(item) {
        return this.isMenuTree() && (item.jsonmenu !== undefined);
    },
    getMenuTree(item) {
        let jsonmenu = undefined;
        if(item.menutext && item.menutext.trim().length > 0) {
            try { jsonmenu = JSON.parse(item.menutext); } catch(ex) { console.error(ex); }
        }
        return jsonmenu;
    },
    menuSelected(item) {
        console.log("SideMenu.vue: menu selected",item);
        this.$emit("item-menu-selected", item);
    },
  },
};
</script>
