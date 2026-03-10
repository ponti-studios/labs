import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Polly',
    description: 'AI browser agent — analyze pages, track spending, time playlists',
    permissions: ['tabs', 'storage', 'scripting', 'sidePanel', 'activeTab'],
    host_permissions: ['<all_urls>', 'http://localhost:4000/'],
    action: {
      default_title: 'Open Polly',
    },
  },
  modules: ['@wxt-dev/module-react'],
})
