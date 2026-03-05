<script lang="ts" setup>
    import { ref } from "vue";

    import { useLoginDialogStore } from "@/state/account/login_dialog";
    import { USERNAME_REGEX_PATTERN } from "@decision-support-ui/common";

    const loginDialog = useLoginDialogStore();

    const form = ref<boolean>(false);

    const required = (value: string) => {
        return !!value || "required";
    };

    const minLength = (min: number) => (value: string) => {
        return value.length >= min || `needs to have at least ${min} characters`;
    };

    const maxLength = (max: number) => (value: string) => {
        return value.length <= max || `cannot have more than ${max} characters`;
    };

    const usernamePattern = (value: string) => {
        return !!value.match(USERNAME_REGEX_PATTERN) || `only letters and numbers are allowed`;
    };
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
                        v-model="loginDialog.username"
                        prepend-icon="mdi-account-circle"
                        name="username"
                        label="Username"
                        type="text"
                        :rules="[required, minLength(3), maxLength(64), usernamePattern]"
                        :error="!!loginDialog.errorMessage"
                    />
                    <v-text-field
                        id="password"
                        v-model="loginDialog.password"
                        prepend-icon="mdi-lock"
                        name="password"
                        label="Password"
                        :append-icon="loginDialog.showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[required, minLength(8), maxLength(32)]"
                        :type="loginDialog.showPass ? 'text' : 'password'"
                        :error-messages="loginDialog.errorMessage"
                        :error="!!loginDialog.errorMessage"
                        @click:append="loginDialog.toggleShowPass"
                        @keyup.enter="loginDialog.login"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" :disabled="!form" @click="loginDialog.register">Register New Account</v-btn>
                    <v-spacer />
                    <v-btn color="primary" type="submit" :disabled="!form" @click="loginDialog.login">Login</v-btn>
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
