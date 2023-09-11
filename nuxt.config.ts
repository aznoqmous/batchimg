
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    nitro: {
        preset: 'node-server'
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/assets/style.scss" as *;'
                }
            }
        }
    }
})
