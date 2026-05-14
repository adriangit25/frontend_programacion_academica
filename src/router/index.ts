import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "../guards/auth.guard";
import AppLayout from "../components/layout/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/LoginView.vue"),
    },
    {
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("../views/dashboard/DashboardView.vue"),
          meta: { title: "Dashboard", requiresAuth: true },
        },
        {
          path: "usuarios",
          name: "usuarios",
          component: () => import("../views/usuarios/UsuariosListView.vue"),
          meta: { title: "Usuarios", requiresAuth: true },
        },
        {
          path: "roles",
          name: "roles",
          component: () => import("../views/roles/RolesListView.vue"),
          meta: { title: "Roles", requiresAuth: true },
        },
        {
          path: "usuario-rol",
          name: "usuario-rol",
          component: () => import("../views/usuario-rol/AsignarRolView.vue"),
          meta: { title: "Asignar Roles", requiresAuth: true },
        },
        {
          path: "menus",
          name: "menus",
          component: () => import("../views/menus/MenusListView.vue"),
          meta: { title: "Menus", requiresAuth: true },
        },
        {
          path: "rol-menu",
          name: "rol-menu",
          component: () => import("../views/rol-menu/AsignarMenuRolView.vue"),
          meta: { title: "Asignar Menus", requiresAuth: true },
        },
        {
          path: "escuelas",
          name: "escuelas",
          component: () => import("../views/escuelas/EscuelasListView.vue"),
          meta: { title: "Escuelas", requiresAuth: true },
        },
        {
          path: "carreras",
          name: "carreras",
          component: () => import("../views/carreras/CarrerasListView.vue"),
          meta: { title: "Carreras", requiresAuth: true },
        },
        {
          path: "areas-conocimiento",
          name: "areas-conocimiento",
          component: () =>
            import("../views/areas-conocimiento/AreasConocimientoListView.vue"),
          meta: { title: "Areas de Conocimiento", requiresAuth: true },
        },
        {
          path: "coordinadores",
          name: "coordinadores",
          component: () =>
            import("../views/coordinadores/CoordinadoresView.vue"),
          meta: { title: "Coordinadores", requiresAuth: true },
        },
        {
          path: "aulas",
          name: "aulas",
          component: () => import("../views/aulas/AulasListView.vue"),
          meta: { title: "Aulas", requiresAuth: true },
        },
        {
          path: "docentes",
          name: "docentes",
          component: () => import("../views/docentes/DocentesListView.vue"),
          meta: { title: "Docentes", requiresAuth: true },
        },
      ],
    },
  ],
});

router.beforeEach(authGuard);

export default router;
