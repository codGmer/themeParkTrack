import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GetApiData from '../api/GetApiData';
export default class HomePage extends React.Component<
    {},
    {
        rideTimes: RideTimesInterface[];
        rideMetaData: RideMetaData[];
        fullRideData: fullRideData[];
        refreshing: boolean;
        failed: boolean;
    }
> {
    constructor(props) {
        super(props);
        this.state = {
            rideTimes: [],
            rideMetaData: [],
            fullRideData: [],
            refreshing: false,
            failed: false
        };
    }

    renderItem = ({ item }) => {
        if(item._secondaryText == null){
            item._secondaryText = '';
        }
        return (
            <TouchableOpacity
                id={item.id}
                onPress={() => this._openDetails({ id: item.id })}
                activeOpacity={0.9}
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    marginBottom: 1,
                    backgroundColor: 'black'
                }}
            >
                <ImageBackground
                    style={{
                        width: '100%',
                        height: 180,
                        margin: 0,
                        alignItems: 'flex-end'
                    }}
                    source={{
                        uri: item.titleImage.url
                    }}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            color: item.open ? 'green' : 'red',
                            width: 'auto',
                            fontWeight: 'bold',
                            marginTop: 10,
                            backgroundColor: 'black',
                            left: 10,
                            position: 'absolute',
                            padding: 2,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 5
                            },
                            shadowOpacity: 0.34,
                            shadowRadius: 6.27,

                            elevation: 15
                        }}
                    >
                        {item.open ? 'Open' : 'Gesloten'}
                    </Text>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.9)', 'transparent']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={{
                                height: 80,
                                width: '100%',
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingBottom:
                                    item.slug !== ''
                                        ? Dimensions.get('window').width < 340
                                            ? 0
                                            : 30
                                        : 30
                            }}
                        >
                            {item.open ? (
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color:
                                            item.waitTime >= 30 &&
                                            item.waitTime < 60
                                                ? 'orange'
                                                : item.waitTime >= 60
                                                ? 'red'
                                                : 'green',
                                        width: 'auto',
                                        fontWeight: 'bold',
                                        marginTop: 10,
                                        backgroundColor: 'black',
                                        left: 10,
                                        position: 'absolute',
                                        paddingRight: 2,
                                        paddingLeft: 2,
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 5
                                        },
                                        shadowOpacity: 0.34,
                                        shadowRadius: 6.27,
                                        elevation: 15
                                    }}
                                >
                                    {item.waitTime
                                        ? item.waitTime + ' min'
                                        : '- min'}
                                </Text>
                            ) : null}
                            <Text
                                style={{
                                    fontSize: item.slug
                                        ? item.slug.length > 35
                                            ? 18
                                            : 20
                                        : 18,
                                    marginTop:
                                        item.open || item._secondaryText.nl
                                            ? 28
                                            : 42,
                                    height: 25,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    textShadowColor: 'rgba(0, 0, 0, 0.4)',
                                    textShadowOffset: {
                                        width: -1,
                                        height: 1
                                    },
                                    textShadowRadius: 10,
                                    elevation: 22
                                }}
                            >
                                {item.slug}
                            </Text>
                            {item._secondaryText.nl ? (
                                <Text
                                    style={{
                                        fontSize:
                                            item._secondaryText.nl.length > 40
                                                ? 12.5
                                                : 14,
                                        color: 'white',
                                        textShadowColor: 'rgba(0, 0, 0, 0.4)',
                                        textShadowOffset: {
                                            width: -1,
                                            height: 1
                                        },
                                        textShadowRadius: 10,
                                        elevation: 22
                                    }}
                                >
                                    {item._secondaryText.nl}
                                </Text>
                            ) : null}
                        </LinearGradient>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    componentDidMount() {
        this._getAPIData(false);
    }

    _openDetails = id => {
        this.props.navigation.navigate('RideDetail', id);
    };

    _getAPIData = async (refreshing: boolean) => {
        if (refreshing) {
            this.setState({ refreshing });
        }
        try {
            let rideTimes = await GetApiData.getRidesTime();
            let rideMetaData = await GetApiData.getRidesMetaData();
            await this.setState({ rideTimes, rideMetaData });
            let fullRideData = [];
            for (let i = 0; i < this.state.rideTimes.length; i++) {
                fullRideData.push({
                    ...this.state.rideTimes[i],
                    ...this.state.rideMetaData.find(
                        itmInner =>
                            itmInner.id ===
                            parseInt(this.state.rideTimes[i].poiId)
                    )
                });
            }
            this.setState({
                fullRideData,
                refreshing: false
            });
        } catch (e) {
            this.setState({ failed: true });
        }
    };

    render() {
        if (this.state.failed) {
            return (
                <Text style={{ color: 'red', textAlign: 'center' }}>
                    Er ging iets mis, controleer je internet
                </Text>
            );
        } else {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={this.state.fullRideData}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => item.poiId}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => this._getAPIData(true)}
                                tintColor="white"
                                title="Sleep omlaag"
                                titleColor="white"
                            />
                        }
                    />
                </View>
            );
        }
    }
}

interface RideTimesInterface {
    open: boolean;
    name: string;
    poiId: string;
    closing: string;
    opening: string;
    showTimes?: any; // geen idee wat dit is?
    waitTime: number;
    updatedAt: string;
    _primaryText: string;
    _secondaryText: string;
    createdAt: string;
    updatedRow: string;
}

interface RideMetaData {
    poiNumber: number;
    poiNumberWinter: number;
    minAge: number;
    maxAge: number;
    minSize: number;
    maxSize: number;
    minSizeEscort: number;
    tags: string[];
    category: string;
    slug: string;
    slugWinter: string;
    area: string;
    parkMonitorReferenceName: string;
    seasons: string[];
    navigationEnabled: boolean;
    navigationEnabledWinter: boolean;
    attachedToNavigationGraph: boolean;
    attachedToNavigationGraphWinter: boolean;
    adminOnly: boolean;
    id: number;
    titleImageId: number;
    titleImageWinterId: number;
    createdAt: Date;
    updatedAt: Date;
    _title: string;
    _titleWinter: string;
    _tagline: string;
    _taglineWinter: string;
    _description: string;
    _descriptionWinter: string;
    _entrance: Object;
    _entranceWinter: Object;
    _exit: any;
    _exitWinter: any;
    _preferredDestinations: string[];
    _preferredDestinationsWinter: string[];
    titleImage: {
        id: number;
        url: string;
    };
}

interface fullRideData {
    open: boolean;
    slug: string;
    waitTime: number;
}

const styles = StyleSheet.create({
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around'
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
