import { createRouter, createWebHashHistory } from "vue-router";

import EditorPage from "./pages/EditorPage.vue";
import ResultsDashboard from "./components/old/ResultsDashboard.vue";
import EstimatesDashboard from "./components/old/EstimatesDashboard.vue";
import CodeDashboard from "./components/old/CodeDashboard.vue";
import LoginForm from "./components/old/LoginForm.vue";
import RegistrationForm from "./components/old/RegistrationForm.vue";
import SettingsDashboard from "./components/old/SettingsDashboard.vue";
import HelpPage from "./pages/HelpPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";
import MetadataPage from "./pages/MetadataPage.vue";

const routes = [
    {
        path: "/",
        component: WelcomePage
    },
    {
        path: "/metadata",
        name: "metadata",
        component: MetadataPage
    },
    {
        path: "/editor",
        name: "editor",
        component: EditorPage
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
