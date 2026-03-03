<script lang="ts" setup>
    import { ref, watch } from "vue";

    import { useLoginDialogStore } from "@/state/account/login_dialog";
    import { useAccountStore } from "@/state/account";

    const account = useAccountStore();
    const loginDialog = useLoginDialogStore();

    const form = ref<boolean>(false);
    const username = ref<string>("");
    const password = ref<string>("");
    const errorMessage = ref<string>("");
    const showPass = ref<boolean>(false);

    watch([username, password], () => (errorMessage.value = ""));

    const login = () => {
        account.login(
            username.value,
            password.value,
            () => {
                loginDialog.closeDialog();
            },
            () => {
                errorMessage.value = "wrong credentials";
            }
        );
    };

    const register = () => {
        account.register(
            username.value,
            password.value,
            () => {
                loginDialog.closeDialog();
            },
            () => {
                errorMessage.value = "username already registered";
            }
        );
    };

    const required = (value: string) => {
        return !!value || "required";
    };

    const minLength = (min: number) => (value: string) => {
        return value.length >= min || `needs to have at least ${min} characters`;
    };

    watch(
        () => loginDialog.isOpen,
        () => {
            username.value = "";
            password.value = "";
        }
    );
</script>

<template>
    <v-dialog
        v-model="loginDialog.isOpen"
        :width="'auto'"
        :height="'auto'"
        class="loginDialog"
        @click:outside="loginDialog.closeDialog()"
    >
        <v-card>
            <v-toolbar>
                <v-toolbar-title>Login</v-toolbar-title>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="loginDialog.closeDialog()"></v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-form v-model="form" @submit.prevent>
                <v-card-text>
                    <p>Login in to an existing account or register a new account:</p>
                    <v-text-field
                        v-model="username"
                        prepend-icon="mdi-account-circle"
                        name="username"
                        label="Username"
                        type="text"
                        :rules="[required, minLength(3)]"
                        :error="!!errorMessage"
                    />
                    <v-text-field
                        id="password"
                        v-model="password"
                        prepend-icon="mdi-lock"
                        name="password"
                        label="Password"
                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[required, minLength(8)]"
                        :type="showPass ? 'text' : 'password'"
                        :error-messages="errorMessage"
                        :error="!!errorMessage"
                        @click:append="showPass = !showPass"
                        @keyup.enter="login"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" type="submit" :disabled="!form" @click="register"
                        >Register New Account</v-btn
                    >
                    <v-spacer />
                    <v-btn color="primary" type="submit" :disabled="!form" @click="login">Login</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
    .loginDialog {
        .v-toolbar {
            background: transparent;
        }

        .v-card {
            padding: 0.5em;
            min-width: 30em;
        }

        .v-card-text {
            padding: 1em 1.5em;
        }

        .v-card-actions {
            padding: 0 1em 1em 1em;
        }

        p {
            margin-bottom: 1em;
        }
    }
</style>
