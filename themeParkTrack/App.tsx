import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator
} from 'react-native';
import {
    createSwitchNavigator,
    createStackNavigator,
    createAppContainer
} from 'react-navigation';
import HomeScreen from './screens/HomePage';

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

const AppStack = createStackNavigator(
    {
        Home: HomeScreen
    },
    {
        initialRouteName: 'Home',
        defaultNavigationOptions: {
            header: null
        }
    }
);

export default createAppContainer(AppStack);

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
