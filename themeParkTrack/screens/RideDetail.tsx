import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    BackHandler,
    AsyncStorage,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Header } from 'react-navigation';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import HTMLView from 'react-native-htmlview';
import GetApiData from '../api/GetApiData';
import HeaderImageScrollView, {
    TriggeringView
} from 'react-native-image-header-scroll-view';
import * as Animatable from 'react-native-animatable';

const MIN_HEIGHT = Header.HEIGHT;
const keyExtractor = item => item.Id;

export default class RideDetail extends React.Component {
    navigationOptions: {
        title: '';
    };
    _isMounted = false;
    id;
    constructor(props) {
        super(props);
        this.id = props.navigation.state.params.id;
        //console.log(props);
        this.state = {
            userLocation: '',
            loading: true,
            dataSource: '',
            favorite: [],
            hidden: false
        };
    }

    _uniqueArray(arrArg) {
        return arrArg.filter((elem, pos, arr) => {
            return arr.indexOf(elem) == pos;
        });
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            AsyncStorage.getItem('userLocation').then(Value => {
                let userLocation = JSON.parse(Value);
                if (userLocation != 'null' && Value != null) {
                    this.setState({
                        userLocation: userLocation
                    });
                    this._getItemDetails(this.id);
                } else {
                    this.setState({ userLocation: '' });
                    this._getItemDetails(this.id);
                }
            });
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackPress
            );
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackPress
        );
        this._isMounted = false;
        //console.log('unmount')
    }

    handleBackPress = () => {
        this.props.navigation.goBack();
        return true;
    };

    isFavorite = item => {
        return this.state.favorite.includes(item.Id);
    };

    _getItemDetails = async (id: number) => {
        let rideTimesDetails = await GetApiData.getRidesTimeDetails(id);
        let rideMetaDataDetails = await GetApiData.getRidesMetaDataDetails(id);
        await this.setState({ rideTimesDetails, rideMetaDataDetails });
        let fullRideData = { ...rideTimesDetails[0], ...rideMetaDataDetails };
        this.setState({ dataSource: fullRideData, loading: false });
    };

    checkFavorite() {
        AsyncStorage.getItem('Favorites').then(Value => {
            let test = JSON.parse(Value);
            if (this._isMounted) {
                if (test != 'null' && Value != null) {
                    this.setState({ favorite: test });
                } else {
                    this.setState({ favorite: [] });
                }
            }
            let favoriteBool = false;
            if (this.isFavorite(this.state.dataSource)) {
                favoriteBool = true;
                this.setState({ favoriteCheck: true });
            } else {
                favoriteBool = false;
                this.setState({ favoriteCheck: false });
            }

            this.props.navigation.setParams({
                favorite: () => this.toggleFav(this.state.dataSource),
                share: () => this._OnShare(this.state.dataSource),
                favoriteCheck: favoriteBool
            });
        });
    }

    _calculateDistanceTwoPoints(uLat, uLng, fLat, fLng) {
        //uLat = user latitude
        //fLat = popular latitude

        var R = 6371; // km
        //has a problem with the .toRad() method below.
        var x1 = fLat - uLat;
        var dLat = this._toRad(x1);
        var x2 = fLng - uLng;
        var dLon = this._toRad(x2);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(uLat)) *
                Math.cos(this._toRad(fLat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return Math.round(d * 10) / 10;
    }

    _calculateDistance = itemList => {
        if (this.state.userLocation !== '' && itemList.Lat !== '0') {
            let distance = this._calculateDistanceTwoPoints(
                this.state.userLocation.coords.latitude,
                this.state.userLocation.coords.longitude,
                itemList.Lat,
                itemList.Lng
            );
            distance !== '' && distance < 200
                ? (itemList.distance = distance)
                : (itemList.distance = '-');
        } else {
            itemList.distance = '-';
        }
        this.setState({ dataSource: itemList, oldData: itemList }, () => {
            this.setState({ loading: false });
        });
    };

    _toRad(Value) {
        /** Converts numeric degrees to radians */
        return (Value * Math.PI) / 180;
    }

    _updateFavoriteDB = () => {
        SecureStore.getItemAsync('userData').then(data => {
            let userID = JSON.parse(data);
            //console.log(this.state.favorite)
            fetch('http://representin.nl/newapp/functions/index.php', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=utf-8',
                    'Access-Control-Allow-Origin': 'http://representin.nl/',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Max-Age': '3600',
                    'Access-Control-Allow-Headers':
                        'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
                },
                body: JSON.stringify({
                    action: 'updateFavorites',
                    userID: userID.UserID,
                    favoriteList: this.state.favorite
                })
            })
                .then(response => response.json())
                .then(responseJson => {
                    //console.log(responseJson);
                })
                .catch(error => {
                    //console.log(error);
                });
        });
    };

    toggleActiveWinItems = item => {
        let activeWinItems = this.state.activeWinItems;
        const id = item;
        // //console.log('------------------------------')
        this.setState(
            ({ activeWinItems }) => ({
                activeWinItems: this.isActiveWinItems(id)
                    ? activeWinItems.filter(a => a !== id)
                    : [...activeWinItems, id]
            }),
            () => {
                if (this.state.activeWinItems !== activeWinItems) {
                    var b = this.state.activeWinItems
                        .toString()
                        .split(',')
                        .map(String);

                    //console.log(this.state.favorite)
                    AsyncStorage.setItem('activeWinItems', JSON.stringify(b));
                    //console.log(this.isActiveWinItems(id));
                    if (!this.isActiveWinItems(id)) {
                        this._deleteActiveWinItemFromUser();
                    } else {
                        this._insertActiveWinItemFromUser();
                    }
                }
            }
        );
    };

    _insertActiveWinItemFromUser = () => {
        SecureStore.getItemAsync('userData').then(data => {
            let userID = JSON.parse(data);

            //console.log(this.state.favorite)
            //console.log(this.state.favorite)
            fetch('http://representin.nl/newapp/functions/index.php', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json;charset=utf-8',
                    'Access-Control-Allow-Origin': 'http://representin.nl/',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Max-Age': '3600',
                    'Access-Control-Allow-Headers':
                        'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
                },
                body: JSON.stringify({
                    action: 'insertActiveWinItemFromUser',
                    userID: userID.UserID,
                    winItem: this.state.dataSource.Id
                })
            })
                .then(response => response.json())
                .then(responseJson => {
                    if (responseJson == 1) {
                        this.setState(
                            {
                                participateInWinSnackText:
                                    'Gelukt, Je doet nu mee met de winactie!'
                            },
                            () => {
                                this.setState({
                                    visible: true
                                });
                            }
                        );
                    } else if (responseJson == 0) {
                        this.setState(
                            {
                                participateInWinSnackText:
                                    'Er ging iets fout, neem contact met ons op!'
                            },
                            () => {
                                this.setState({
                                    visible: true
                                });
                            }
                        );
                    }
                })
                .catch(error => {
                    //console.log(error);
                });
        });
    };

    toggleFav = item => {
        let favorite = this.state.favorite;
        const id = keyExtractor(item);
        //console.log('------------------------------')
        this.setState(
            ({ favorite }) => ({
                favorite: this.isFavorite(item)
                    ? favorite.filter(a => a !== id)
                    : [...favorite, id]
            }),
            () => {
                if (this.state.favorite !== favorite) {
                    AsyncStorage.setItem(
                        'Favorites',
                        JSON.stringify(this.state.favorite)
                    ).then(() => {
                        if (this.isFavorite(item)) {
                            this.props.navigation.setParams({
                                favoriteCheck: true
                            });
                        } else {
                            this.props.navigation.setParams({
                                favoriteCheck: false
                            });
                        }
                        this._updateFavoriteDB();
                    });
                }
            }
        );
    };

    render() {
        if (this.state.loading || this._isMounted == false) {
            return (
                <View style={[styles.horizontal, styles.container]}>
                    <ActivityIndicator size="large" color="black" />
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                    <HeaderImageScrollView
                        maxHeight={180}
                        minHeight={80}
                        fadeOutForeground
                        maxOverlayOpacity={0.5}
                        minOverlayOpacity={0.0}
                        renderHeader={() => (
                            <Image
                                source={{
                                    uri: this.state.dataSource.titleImage.url
                                }}
                                style={styles.image}
                            />
                        )}
                        renderForeground={() => {
                            <View style={styles.titleContainer}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.9)', 'transparent']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 0, y: 0 }}
                                    style={{
                                        height: 80,
                                        width: '100%',
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        paddingBottom: 30
                                    }}
                                >
                                    {typeof this.state.dataSource.distance !==
                                        'undefined' &&
                                    this.state.dataSource !== '' ? (
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: 'white',
                                                width: '100%',
                                                fontWeight: 'bold',
                                                marginTop: 5,
                                                backgroundColor: 'black',
                                                width: 'auto',
                                                left: 10,
                                                position: 'absolute',
                                                padding: 2
                                            }}
                                        >
                                            {this.state.dataSource.distance +
                                                ' KM'}
                                        </Text>
                                    ) : null}
                                    <Text
                                        style={{
                                            fontSize:
                                                this.state.dataSource.slug
                                                    .length > 35
                                                    ? 18
                                                    : 20,
                                            marginTop:
                                                this.state.dataSource.slug !==
                                                '1'
                                                    ? 28
                                                    : 45,
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {this.state.dataSource.slug}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: 'white',
                                            width: '100%',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </LinearGradient>
                            </View>;
                        }}
                        renderFixedForeground={() => (
                            <Animatable.View
                                ref={navTitleView => {
                                    this.navTitleView = navTitleView;
                                }}
                                style={
                                    this.state.hidden
                                        ? {}
                                        : {
                                              position: 'absolute',
                                              bottom: 0,
                                              width: '100%'
                                          }
                                }
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
                                            this.state.dataSource.Locatie !==
                                                '' ||
                                            this.state.dataSource.Plaatsnaam !==
                                                ''
                                                ? Dimensions.get('window')
                                                      .width < 340
                                                    ? 0
                                                    : 30
                                                : 30
                                    }}
                                >
                                    {this.state.dataSource.distance !== '' &&
                                    typeof this.state.dataSource.distance !==
                                        'undefined' ? (
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: 'white',
                                                width: '100%',
                                                fontWeight: 'bold',
                                                marginTop: 12,
                                                backgroundColor: 'black',
                                                width: 'auto',
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
                                            {this.state.dataSource.distance +
                                                ' KM'}
                                        </Text>
                                    ) : null}
                                    <Text
                                        style={{
                                            fontSize:
                                                this.state.dataSource.slug
                                                    .length > 35
                                                    ? 18
                                                    : 20,
                                            marginTop: 28,
                                            height: 25,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textShadowColor:
                                                'rgba(0, 0, 0, 0.4)',
                                            textShadowOffset: {
                                                width: -1,
                                                height: 1
                                            },
                                            textShadowRadius: 10,
                                            elevation: 22
                                        }}
                                    >
                                        {this.state.dataSource.slug}
                                    </Text>
                                </LinearGradient>
                            </Animatable.View>
                        )}
                    >
                        <TriggeringView
                            style={styles.section}
                            onHide={() => {
                                this.setState({ hidden: true });
                                this.navTitleView.fadeInUp(200);
                            }}
                            onDisplay={() => {
                                this.setState({ hidden: false });
                            }}
                        />
                        <View
                            style={{
                                paddingLeft: 5,
                                paddingRight: 5,
                                paddingBottom: 5
                            }}
                        >
                            <View
                                style={{
                                    elevation: 3,
                                    borderWidth: 1,
                                    borderTopWidth: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    paddingBottom: 10,
                                    borderColor: 'transparent'
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 15,
                                        marginTop: 10,
                                        marginBottom: 10,
                                        color: 'grey'
                                    }}
                                >
                                    Info
                                </Text>
                                <HTMLView
                                    value={
                                        '<div>' +
                                        this.state.dataSource._description.nl +
                                        '</div>'
                                    }
                                    stylesheet={styles}
                                />
                                {this.state.dataSource.area !== '' ? (
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            marginTop: 10,
                                            marginBottom: 10,
                                            color: 'grey'
                                        }}
                                    >
                                        Gebied
                                    </Text>
                                ) : null}
                                {this.state.dataSource.area != '' ? (
                                    <Text style={{ fontSize: 17 }}>
                                        {this.state.dataSource.area}
                                    </Text>
                                ) : null}
                                {this.state.dataSource.Datum_Eind != '' ? (
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            marginTop: 10,
                                            marginBottom: 10,
                                            color: 'grey'
                                        }}
                                    >
                                        Sluit
                                    </Text>
                                ) : null}
                                {this.state.dataSource._secondaryText.nl !=
                                '' ? (
                                    <Text style={{ fontSize: 17 }}>
                                        {
                                            this.state.dataSource._secondaryText
                                                .nl
                                        }
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </HeaderImageScrollView>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    div: {
        fontSize: 17
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
    },

    header: {
        alignItems: 'center',
        backgroundColor: 'black',
        width: '100%',
        height: 59,
        flexDirection: 'row'
    },

    headerLogo: {
        resizeMode: 'center'
    },

    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },

    image: {
        height: 180,
        width: Dimensions.get('window').width,
        alignSelf: 'stretch',
        resizeMode: 'cover'
    },
    titleContainer: {
        flex: 1,
        alignSelf: 'stretch'
    },
    navTitleView: {
        height: MIN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
        opacity: 0
    }
});
