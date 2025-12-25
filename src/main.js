import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useUserStore } from "@/stores/user";

const app = createApp(App)

app.use(createPinia())
app.use(router)

const token = localStorage.getItem("accessToken");
if (token) {
    useUserStore().setFromToken(token);
}

app.mount('#app')
