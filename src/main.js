import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import { useUserStore } from "@/stores/user";

import $ from "jquery";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";

window.jQuery = $;
window.$ = $;

const app = createApp(App);

app.use(createPinia());
app.use(router);

const token = localStorage.getItem("accessToken");
if (token) {
    useUserStore().setFromToken(token);
}

app.mount("#app");
