<template>
    <li v-if="hasProg">
      <a href="javascript:void(0);" @click="menuClick(menu)" class="fa-link-menu-item menu-desktop" :data-pid="menu.itemname" :data-url="prog?.url" :data-path="prog?.progpath" :title="menu.itemname">
        {{ menu.text }}
      </a>
    </li>
    <li v-else class="dropdown">
      <a @click="groupClick(menu)" class="nav-menu-group dropdown-toggle collapsed active" data-toggle="collapse" :data-target="'#tmenu_'+menuId" :href="'javascript:void(0);#tmenu_'+menuId">
        <em class="fa fa-list-alt"></em>&nbsp;
        <span class="nav-label group-label">{{ menu.text }}</span>
      </a>
      <ul :id="'tmenu_'+menuId" class="sub-menu panel-collapse collapse" role="menu" v-if="hasItems">    
        <template v-for="(item,index) in menu.items" :key="index">
          <SiderMenuTree :menu="item" :menuId="getMenuId()" @menu-selected="menuSelected" @group-selected="groupSelected" />
        </template>    
      </ul>
    </li>
</template>
<script>
import { randomNumber } from "@willsofts/will-app";
import { progmap } from "@/assets/js/sider.js";
export default {
    name: 'SiderMenuTree',
    props: {
      menu: Object,
      menuId: String,
    },
    setup() {
      return { progmap };
    },
    computed: {
      prog() {
        return this.progmap[this.menu.itemname];
      },
      hasItems() {
        return this.menu.items && this.menu.items.length > 0;
      },
      hasProg() {
        return this.menu.itemname && this.menu.itemname.trim().length > 0;
      },
    },
    methods: {
        getMenuId() { return randomNumber()+"_"+new Date().getTime(); },
        menuClick(item) {
          let prog = this.progmap[item.itemname];
          console.log("menu click",item,"prog",prog);
          this.$emit("menu-selected", prog);
        },
        menuSelected(item) {
          console.log("menu selected",item);
          this.$emit("menu-selected", item);
        },
        groupClick(item) {
          console.log("group click",item);
          this.$emit('group-selected', item);
        },
        groupSelected(item) {
          console.log("group selected",item);
          this.$emit('group-selected', item);
        },
    },
};
</script>
  