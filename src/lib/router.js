/**
 * This file is provided ready-made for use in your application by HackYourFuture.
 * There should be no reason to make any changes to this file.
 */

import log from './logger.js';
import createObservableState from './observableState.js';

const observableState = createObservableState();

function updateState(updates) {
  const newState = observableState.updateState(updates);
  log.debug('state', newState);
  return newState;
}

function getState() {
  return observableState.getState();
}

function navigateTo(path, ...params) {
  log.silly('navigateTo', 'path:', path, 'params:', [...params]);
  const encodedHash = encodeURI('#' + [path, ...params].join('/'));
  window.location.assign(encodedHash);
}

function getRouteParts() {
  const [hash, ...rest] = decodeURI(window.location.hash).split('/');
  const path = hash.replace('#', '');
  return [path, ...rest];
}

function getDefaultRoute(routes) {
  const defaultRoute = routes.find((route) => route.default);
  if (!defaultRoute) {
    throw new Error('Missing default route in routes table');
  }
  return defaultRoute;
}

function findRouteByPathname(routes, pathname) {
  return routes.find((route) => route.path === pathname);
}

function onHashChange(routerState) {
  const { routes, pageRoot, currentPage } = routerState;

  const [pathname, ...params] = getRouteParts();

  // Find the page corresponding to the current hash value
  const route = findRouteByPathname(routes, pathname);

  // If not found, redirect to default page
  if (!route) {
    navigateTo(getDefaultRoute(routes).path);
    return;
  }

  // Call optional willUnmount lifecycle method.
  currentPage.onWillUnmount?.();

  if (typeof currentPage.update === 'function') {
    // Unsubscribe the current page from the state observable.
    observableState.unsubscribe(currentPage.update);
  }

  // Create the page corresponding to the route.
  const newPage = route.page(...params);

  log.debug('router', `loading page: ${pathname}, params: ${[...params]}`);

  if (typeof newPage.update === 'function') {
    // Subscribe the new page to the state observable.
    observableState.subscribe(newPage.update);
  }

  // Clear the content of the pageRoot container and append the page
  // root element as its new child.
  pageRoot.innerHTML = '';
  pageRoot.appendChild(newPage.root);

  // Call optional didMount lifecycle method.
  newPage.onDidMount?.();

  routerState.currentPage = newPage;
}

function logRoutesTable(routes) {
  if (log.isMinLevel('debug')) {
    // Log the routes table to the console
    console.log('Routes Table:');
    const displayRoutes = routes.map((route) => ({
      ...route,
      page: route.page.name,
    }));
    console.table(displayRoutes);
  }
}

function createRouter() {
  let routerState;

  const start = (routes, pageRoot, initialState = {}) => {
    logRoutesTable(routes);

    routerState = { routes, pageRoot, currentPage: {} };

    window.addEventListener('hashchange', () => onHashChange(routerState));

    // Kick-start the router
    observableState.updateState(initialState);
    onHashChange(routerState);
  };

  return { start, navigateTo, updateState, getState };
}

export default createRouter();
