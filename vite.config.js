import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // sockjs-client나 기타 라이브러리에서 global을 사용하는 경우를 위한 폴리필
    // axios는 이 설정이 필요 없지만, 향후 다른 라이브러리 사용 시를 대비해 유지
    global: 'globalThis',
  },
  server: {
    port: 5173, // 포트를 5173으로 고정
    strictPort: true, // 포트가 사용 중이면 에러 발생
    open: false, // 서버 시작 시 브라우저 자동 열기 (false로 설정)
    cors: true, // CORS 활성화
    proxy: {
      // API 프록시 설정 (선택사항 - 직접 백엔드 호출 시 불필요)
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  build: {
    // 프로덕션 빌드 최적화
    sourcemap: false, // 소스맵 생성 비활성화 (프로덕션)
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 제한 (KB)
    rollupOptions: {
      output: {
        // 청크 분할 전략
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
