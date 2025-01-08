<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-card class="pa-4" width="350">
      <h2 class="text-center mb-2">Регистрация</h2>
      <v-form @submit.prevent="verifyCaptcha">
        <v-text-field
          label="Электронная почта"
          v-model="email"
          :rules="[validateEmail]"
          required
        ></v-text-field>
        <v-text-field
          label="Пароль"
          v-model="password"
          required
          type="password"
        ></v-text-field>
        <div class="captcha-container" v-html="captchaImage"></div>
        <div class="container">
          <v-text-field
            label="Введите капчу"
            v-model="captchaCode"
            required
          ></v-text-field>
        </div>
        <v-btn type="submit" color="primary" class="mt-3 mb-5" block
          >Зарегистрироваться</v-btn
        >
      </v-form>
      <v-divider class="my-4"></v-divider>
      <v-btn block @click="navigateToLogin">Вход</v-btn>
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

import validator from "validator";

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

    // Кастомное правило для проверки email
    const validateEmail = (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        validator.isEmail(value) || "Введите корректный адрес электронной почты"
      );
    };

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

        captchaCode.value = "";

        if (response.data.success) {
          register(); // Call the register function after successful captcha verification
        } else {
          showSnackbar("Неверная капча", "error");
          fetchCaptcha(); // Refresh captcha if verification fails
        }
      } catch (error) {
        showSnackbar("Ошибка при проверке капчи", "error");
        fetchCaptcha();
      }
    };

    const register = async () => {
      try {
        const response = await axios.post(
          `${API_ENDPOINT}/user/register`,
          {
            email: email.value,
            password: password.value,
            captchaCode: captchaCode.value,
          },
          { withCredentials: true }
        );
        showSnackbar("Регистрация выполнена успешно", "success");
        router.push("/login");
      } catch (error) {
        const errorMessage = error.response.data.error;

        email.value = "";

        showSnackbar(errorMessage || "Ошибка регистрации", "error");
        fetchCaptcha(); // Обновляем капчу при ошибке
      }
    };

    const navigateToLogin = () => {
      router.push("/login");
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
      validateEmail,
      register,
      navigateToLogin,
    };
  },
};
</script>

<style scoped></style>
