<template>
  <v-container>
    <h1 class="mb-5">Личный кабинет</h1>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <p>Добро пожаловать, {{ user?.email }}</p>
    <v-btn color="primary" @click="logout" class="mt-5">Выйти</v-btn>
  </v-container>
</template>

<script>
import axios from "axios";
import { useRoute, useRouter } from "vue-router"; // Импорт для извлечения параметров маршрута
import { API_ENDPOINT } from "../config/api";
import { ref, onMounted } from "vue";

export default {
  setup() {
    const route = useRoute(); // Используем маршрут для получения query параметров
    const router = useRouter();

    const accessToken = ref(localStorage.getItem("accessToken"));

    onMounted(() => {
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 403) {
            localStorage.removeItem("accessToken");
            router.push("/login");
          }

          return Promise.reject(error);
        }
      );
    });

    onMounted(() => {
      if (!accessToken.value) {
        router.push("/login"); // Перенаправляем, если токен отсутствует
      } else {
        // Проверяем токен на сервере
        axios
          .get(`${API_ENDPOINT}/user/validate`, {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          })
          .catch(() => {
            localStorage.removeItem("accessToken"); // Удаляем токен, если он недействителен
            router.push("/login");
          });
      }
    });

    onMounted(() => console.log(`2 + 2 = ${2 + 2}`));

    const user = ref(null);

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

    const getUserInfo = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
          {
            withCredentials: true,
          }
        );

        // console.log(response.data.user);

        user.value = response.data.user;
      } catch (err) {
        console.error("Ошибка при получении данных пользователя", err);
      }
    };

    getUserInfo();

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
      user,
    };
  },
};
</script>
