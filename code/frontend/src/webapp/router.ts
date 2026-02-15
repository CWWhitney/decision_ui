import { createRouter, createWebHashHistory } from "vue-router";

import EditorPage from "./pages/EditorPage.vue";
import LoginForm from "./components/old/LoginForm.vue";
import RegistrationForm from "./components/old/RegistrationForm.vue";
import HelpPage from "./pages/HelpPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";
import MetadataPage from "./pages/MetadataPage.vue";
import AnalyzePage from "./pages/AnalyzePage.vue";
import EstimatesTablePage from "./pages/EstimatesTablePage.vue";
import CodePage from "./pages/CodePage.vue";
import SettingsPage from "./pages/SettingsPage.vue";

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
        path: "/analyze",
        name: "analyze",
        component: AnalyzePage
    },
    {
        path: "/estimates",
        component: EstimatesTablePage
    },
    {
        path: "/code",
        component: CodePage
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
        component: SettingsPage
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
