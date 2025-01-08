<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-card class="pa-4" min-width="300" max-width="400">
      <h2 class="text-center mb-2">Вход</h2>
      <v-form @submit.prevent="verifyCaptcha">
        <v-text-field
          label="Электронная почта"
          v-model="email"
          required
        ></v-text-field>
        <v-text-field
          label="Пароль"
          v-model="password"
          type="password"
          required
        ></v-text-field>
        <div class="captcha-container" v-html="captchaImage"></div>
        <v-text-field
          label="Введите капчу"
          v-model="captchaCode"
          required
        ></v-text-field>
        <v-btn type="submit" color="success" class="mt-3" block>Войти</v-btn>
      </v-form>
      <v-divider class="my-4"></v-divider>
      <v-btn block @click="navigateToRegister">Регистрация</v-btn>
      <v-snackbar
        v-model="snackbar.visible"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
      >
        {{ snackbar.message }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import { API_ENDPOINT } from "../config/api";
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const captchaCode = ref("");
    const captchaImage = ref("");
    const snackbar = ref({
      visible: false,
      message: "",
      color: "",
      timeout: 3000,
    });

    const fetchCaptcha = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/user/captcha`, {
          withCredentials: true,
        });
        captchaImage.value = response.data;
      } catch (error) {
        console.error(error);
        showSnackbar("Ошибка при загрузке капчи", "error");
      }
    };

    const verifyCaptcha = async () => {
      try {
        const response = await axios.post(
          `${API_ENDPOINT}/user/verify-captcha`,
          { captchaCode: captchaCode.value },
          { withCredentials: true }
        );

        if (response.data.success) {
          login(); // Call the login function after successful captcha verification
        } else {
          captchaCode.value = "";
          showSnackbar("Неверная капча", "error");
          fetchCaptcha(); // Refresh captcha if verification fails
        }
      } catch (error) {
        showSnackbar("Ошибка при проверке капчи", "error");
        fetchCaptcha();
      }
    };

    const login = async () => {
      try {
        const response = await axios.post(
          `${API_ENDPOINT}/user/login`,
          {
            email: email.value,
            password: password.value,
            captchaCode: captchaCode.value,
          },
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", response.data.accessToken);
        showSnackbar("Вход выполнен успешно", "success");
        router.push({
          path: "/dashboard",
          query: { successAuth: 1 },
        });
      } catch (error) {
        showSnackbar(
          error.response.data.error || "Ошибка авторизации",
          "error"
        );
        fetchCaptcha(); // Обновляем капчу при ошибке
      }
    };

    const navigateToRegister = () => {
      router.push("/register");
    };

    const showSnackbar = (message, color) => {
      snackbar.value.message = message;
      snackbar.value.color = color;
      snackbar.value.visible = true;
    };

    fetchCaptcha(); // Загружаем капчу при монтировании компонента

    return {
      email,
      password,
      captchaCode,
      captchaImage,
      snackbar,
      verifyCaptcha,
      login,
      navigateToRegister,
    };
  },
};
</script>

<style>
.fill-height {
  height: 100vh;
}
</style>
