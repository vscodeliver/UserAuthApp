import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: "/login",
    component: Login,
    beforeEnter: authGuard,
  },
  {
    path: "/register",
    component: Register,
    beforeEnter: authGuard,
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Защита маршрутов, требующих авторизации
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      next("/login"); // Перенаправляем на /login, если токен отсутствует
    } else {
      next(); // Продолжаем загрузку маршрута
    }
  } else {
    next(); // Продолжаем для публичных маршрутов
  }
});

function authGuard(to, from, next) {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    next("/dashboard"); // Перенаправляем на /dashboard
  } else {
    next(); // Продолжаем загрузку маршрута
  }
}

export default router;
