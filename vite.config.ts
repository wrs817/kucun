import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/inventory_management/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        register: 'register.html',
        products: 'products.html',
        'products-new': 'products-new.html',
        'products-edit': 'products-edit.html',
        sales: 'sales.html',
        'sales-new': 'sales-new.html',
        'goods-in': 'goods-in.html',
        'goods-in-new': 'goods-in-new.html',
      },
    },
  },
})
