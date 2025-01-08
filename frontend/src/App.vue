<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Глобальные стили для центрирования содержимого */
.fill-height {
  height: 100vh;
}

.captcha-container {
  display: flex;
  justify-content: center;
  margin: 0rem 0 1rem 0;
}
</style>
