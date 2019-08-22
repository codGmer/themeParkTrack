import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import {
    createDrawerNavigator,
    createStackNavigator,
    createAppContainer
} from 'react-navigation';
import HomeScreen from './screens/HomePage';
import RideDetail from './screens/RideDetail';
import HomeHistory from './screens/HomeHistory';

export class App extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        // };
    }

    state = {
        isLoadingComplete: false,
        LoadingComplete: false
    };

    componentWillMount() {}
    componentDidMount() {}
    render() {
        return (
            <View style={[styles.horizontal, styles.container]}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }
}

const waitingTimeStack = createStackNavigator(
    {
        Home: HomeScreen,
        RideDetail: RideDetail
    },
    {
        initialRouteName: 'Home'
    }
);

const historyStack = createStackNavigator(
    {
        HomeHistory: HomeHistory
    },
    {
        initialRouteName: 'HomeHistory'
    }
);

const DrawerStack = createDrawerNavigator({
    'Huidige Wachttijden': waitingTimeStack,
    Geschiedenis: historyStack
});

export default createAppContainer(DrawerStack);

const styles = StyleSheet.create({
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 1
    }
});
