export default class GetApiData {
    static async getRidesTime(): Promise<RideTimesInterface[]> {
        const response = await fetch(
            'https://api.phlsys.de/api/signage-snapshots?compact=true&access_token=auiJJnDpbIWrqt2lJBnD8nV9pcBCIprCrCxaWettkBQWAjhDAHtDxXBbiJvCzkUf&loc=50.800353,6.879447',
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );
        const list = (await response.json()) as RideTimesInterface[];
        const sortedList = list.sort(function(a, b) {
            return b.waitTime - a.waitTime;
        });
        return sortedList;
    }

    static async getRidesMetaData(): Promise<RideMetaData[]> {
        const response = await fetch(
            'https://api.phlsys.de/api/pois?compact=true&access_token=auiJJnDpbIWrqt2lJBnD8nV9pcBCIprCrCxaWettkBQWAjhDAHtDxXBbiJvCzkUf`',
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );
        return (await response.json()) as RideMetaData[];
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
    messages: string[];
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
