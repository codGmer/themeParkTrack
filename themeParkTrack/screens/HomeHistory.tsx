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
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from 'react-native-chart-kit';
import GetApiData from '../api/GetApiData';

const graphStyle = {
    marginVertical: 8
};

export default class HomeHistory extends React.Component<
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
            failed: false,
            data: '',
            loading: true
        };
    }

    componentDidMount() {
        this._getAPIData(false);
    }

    _getAPIData = async (refreshing: boolean) => {
        if (refreshing) {
            this.setState({ refreshing });
        }
        try {
            let monthAvgWaitTime = await GetApiData.monthAvgWaitTime(8);
            await this.setState(previousState => ({
                data: {
                    labels: ['Augustus'],
                    datasets: [{ data: [monthAvgWaitTime[0].AvgWaitTime] }]
                }
            }));
            this.setState({ loading: false });
        } catch (e) {
            console.log(e);
            this.setState({ failed: true });
        }
    };

    render() {
        const width = Dimensions.get('window').width;
        if (this.state.failed || this.state.loading) {
            return (
                <Text style={{ color: 'red', textAlign: 'center' }}>
                    Er ging iets mis, controleer je internet
                </Text>
            );
        } else {
            return (
                <BarChart
                    style={graphStyle}
                    fromZero={true}
                    data={this.state.data}
                    width={width}
                    height={220}
                    chartConfig={{
                        backgroundColor: 'grey',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        }
                    }}
                />
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
