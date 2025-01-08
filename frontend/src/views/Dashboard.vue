<template>
  <v-container>
    <h1 class="mb-5">Приватная страница</h1>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <p>Добро пожаловать! Вы авторизованы.</p>
    <v-btn color="primary" @click="logout" class="mt-5">Выйти</v-btn>
  </v-container>
</template>

<script>
import axios from "axios";
import { useRoute, useRouter } from "vue-router"; // Импорт для извлечения параметров маршрута
import { API_ENDPOINT } from "../config/api";
import { ref } from "vue";

export default {
  setup() {
    const route = useRoute(); // Используем маршрут для получения query параметров
    const router = useRouter();

    const snackbar = ref({
      visible: false,
      message: "",
      color: "",
      timeout: 3000,
    });

    const { successAuth } = route.query; // Получаем сообщение об успехе

    const logout = async () => {
      try {
        await axios.post(
          `${API_ENDPOINT}/user/logout`,
          {},
          { withCredentials: true }
        );
        localStorage.removeItem("accessToken");
        router.push("/login");
      } catch (err) {
        console.error("Ошибка при выходе:", err);
      }
    };

    const showSnackbar = (message, color) => {
      snackbar.value.message = message;
      snackbar.value.color = color;
      snackbar.value.visible = true;
    };

    const successAuthMessage = "Вы успешно вошли в систему";

    if (!!+successAuth) {
      showSnackbar(successAuthMessage, "green");
    }

    return {
      logout,
      snackbar,
    };
  },
};
</script>
