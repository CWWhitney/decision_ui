import { createRouter, createWebHashHistory } from "vue-router";

import EditorPage from "./pages/EditorPage.vue";
import HelpPage from "./pages/HelpPage.vue";
import WelcomePage from "./pages/WelcomePage.vue";
import MetadataPage from "./pages/MetadataPage.vue";
import AnalyzePage from "./pages/AnalyzePage.vue";
import EstimatesTablePage from "./pages/EstimatesTablePage.vue";
import CodePage from "./pages/RPage.vue";
import HelpAllPage from "./pages/HelpAllPage.vue";

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
        name: "estimates",
        component: EstimatesTablePage
    },
    {
        path: "/r",
        name: "r",
        component: CodePage
    },
    {
        path: "/r/:variantTab/:displayTab",
        name: "rTabs",
        component: CodePage
    },
    {
        path: "/help",
        name: "help",
        component: HelpPage
    },
    {
        path: "/help/all",
        name: "help-all",
        component: HelpAllPage
    },
    {
        path: "/help/:path*",
        name: "help",
        component: HelpPage
    }
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
