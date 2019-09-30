import { NavigationActions } from 'react-navigation';

var _navigator;

function setNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function goTo(routeName, params = {}, key) {
  if (_navigator)
    _navigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params,
        key
      })
    );
  else console.warn("no navigator!!");
}

function reset(routeName, params) {
  _navigator.dispatch({
    type: 'Navigation/RESET',
    index: 0,
    actions: [{ type: 'Navigate', routeName, params }]
  });
}

function goBack(params) { 
  _navigator.dispatch(NavigationActions.back())
}

export {
  goTo,
  goBack,
  setNavigator,
  reset
}