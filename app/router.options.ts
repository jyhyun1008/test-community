import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
  routes: (_routes) => _routes.filter(route =>
    !route.path.startsWith('/users/') &&
    !route.path.startsWith('/.well-known/')
  ),
}