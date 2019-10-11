import routes from './routes';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'

const Navigation = createStackNavigator(
	routes,
	{
		initialRouteName: 'Login',
		headerMode:'none',
	}
);

const AppContainer = createAppContainer(Navigation);

export default AppContainer;