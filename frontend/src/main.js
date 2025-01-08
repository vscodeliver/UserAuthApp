import { createApp } from "vue";
import App from "./App.vue";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi"; // Иконки
import router from "./router";

// Vuetify theme
const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "light",
  },
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount("#app");
