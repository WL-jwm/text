import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    esbuild: {
      pure: ['console.log', 'console.info', 'console.warn', 'console.debug'],
      drop: ['debugger'],
    },
    rollupOptions: {
      output: {
        // 页面路由chunk命名：使懒加载chunk名可读
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id, { getModuleInfo }) {
          // 核心框架
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide'
          }
          // 数据模块按体积拆分chunk
          if (id.includes('/src/data/')) {
            if (id.includes('resources')) return 'data-resources';
            if (id.includes('searchIndex')) return 'data-search';
            // 大文件独立chunk：仅被懒加载页面引用，避免首页加载时一并下载
            if (id.includes('hydrogeologyHistorical')) return 'data-hydrogeo-historical';
            if (id.includes('mapData')) return 'data-map';
            if (id.includes('groundwaterResources')) return 'data-gw-resources';
            if (id.includes('zoneParams') || id.includes('hydroParams')) return 'data-hydro-params';
            return 'data-modules';
          }
          // CrossLink组件独立chunk（被17个页面共享引用）
          if (id.includes('CrossLink')) {
            return 'shared-crosslink'
          }
          // 工具模块
          if (id.includes('exportUtils')) {
            return 'shared-utils'
          }
        },
      },
    },
  },
})