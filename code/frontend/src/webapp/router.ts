import { createRouter, createWebHashHistory } from "vue-router";

import FlowPage from "./pages/ModelPage.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";
import LoginForm from "./components/LoginForm.vue";
import RegistrationForm from "./components/RegistrationForm.vue";
import SettingsDashboard from "./components/SettingsDashboard.vue";
import HelpPage from "./pages/HelpPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";

const routes = [
    {
        path: "/",
        component: WelcomePage
    },
    {
        path: "/editor",
        name: "editor",
        component: FlowPage
    },
    {
        path: "/estimates",
        component: EstimatesDashboard
    },
    {
        path: "/results",
        component: ResultsDashboard
    },
    {
        path: "/code",
        component: CodeDashboard
    },
    {
        path: "/help",
        name: "help",
        component: HelpPage
    },
    {
        path: "/help/:path*",
        name: "help",
        component: HelpPage
    },
    {
        path: "/settings",
        component: SettingsDashboard
    },
    {
        path: "/login",
        component: LoginForm
    },
    {
        path: "/register",
        component: RegistrationForm
    }
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
