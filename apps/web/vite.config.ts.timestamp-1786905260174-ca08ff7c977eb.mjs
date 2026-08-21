// vite.config.ts
import { defineConfig } from 'file:///D:/ITI_Graduation_Project/Project/hathor/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.43_lightningcss@1.32.0/node_modules/vite/dist/node/index.js';
import react from 'file:///D:/ITI_Graduation_Project/Project/hathor/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@20.19.43_lightningcss@1.32.0_/node_modules/@vitejs/plugin-react/dist/index.js';
import { TanStackRouterVite } from 'file:///D:/ITI_Graduation_Project/Project/hathor/node_modules/.pnpm/@tanstack+router-plugin@1.168.23_@tanstack+react-router@1.170.18_react-dom@18.3.1_react@18.3._55ghdhplr6fna3q3cewbdrjbuu/node_modules/@tanstack/router-plugin/dist/esm/vite.js';
var vite_config_default = defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePattern:
        '((components|assets|data|utils|types|ui|inspector|modals|sidebar|controls|canvas)/.*|.*Data\\.ts|.*Cache\\.ts|.*\\.d\\.ts)',
    }),
    react(),
  ],
  server: {
    port: 3e3,
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxJVElfR3JhZHVhdGlvbl9Qcm9qZWN0XFxcXFByb2plY3RcXFxcaGF0aG9yXFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxJVElfR3JhZHVhdGlvbl9Qcm9qZWN0XFxcXFByb2plY3RcXFxcaGF0aG9yXFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9JVElfR3JhZHVhdGlvbl9Qcm9qZWN0L1Byb2plY3QvaGF0aG9yL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gJ0B0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBUYW5TdGFja1JvdXRlclZpdGUoe1xyXG4gICAgICByb3V0ZXNEaXJlY3Rvcnk6ICcuL3NyYy9yb3V0ZXMnLFxyXG4gICAgICBnZW5lcmF0ZWRSb3V0ZVRyZWU6ICcuL3NyYy9yb3V0ZVRyZWUuZ2VuLnRzJyxcclxuICAgICAgcm91dGVGaWxlSWdub3JlUGF0dGVybjpcclxuICAgICAgICAnKChjb21wb25lbnRzfGFzc2V0c3xkYXRhfHV0aWxzfHR5cGVzfHVpfGluc3BlY3Rvcnxtb2RhbHN8c2lkZWJhcnxjb250cm9sc3xjYW52YXMpLy4qfC4qRGF0YVxcXFwudHN8LipDYWNoZVxcXFwudHN8LipcXFxcLmRcXFxcLnRzKScsXHJcbiAgICB9KSxcclxuICAgIHJlYWN0KCksXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVYsU0FBUyxvQkFBb0I7QUFDOVcsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsMEJBQTBCO0FBRW5DLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLG1CQUFtQjtBQUFBLE1BQ2pCLGlCQUFpQjtBQUFBLE1BQ2pCLG9CQUFvQjtBQUFBLE1BQ3BCLHdCQUNFO0FBQUEsSUFDSixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
