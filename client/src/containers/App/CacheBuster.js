import React from 'react';
import axios from "util/Api";

let CURRENT_VERSION = "0.1";
let isHardReloadDone = false;
// version from response - first param, local version second param
const semverGreaterThan = (versionA, versionB) => {
    if (versionB && versionA) {
        if (versionA !== versionB) {
            localStorage.setItem('latestVersion', versionB.toString())
            return true
        }
    }
    return false
};
const refreshCacheAndReload = async () => {
    if (!isHardReloadDone) {
        isHardReloadDone = true;
        if (caches) {
            // Service worker cache should be cleared with caches.delete()
            caches.keys().then(async (names) => {
                for (let name of names) {
                    await caches.delete(name);
                }
            });
        }
        // delete browser cache and hard reload
        window.location.reload(true);
    }
}
class CacheBuster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
        };
    }

    async componentDidMount() {
        if (window.localStorage.length === 0) {
            if (!localStorage.getItem('latestVersion')) {
                console.log('set current version', CURRENT_VERSION)
                localStorage.setItem('latestVersion', CURRENT_VERSION)
            }
        }
        else if (!localStorage.getItem('latestVersion')) {
            console.log('set current version', CURRENT_VERSION)
            localStorage.setItem('latestVersion', CURRENT_VERSION)
        }
        let PROJECT_LATEST_VERSION = CURRENT_VERSION;
        let configResponse = await axios.get(`/admin/project-latest-version?t=${new Date().toISOString()}`);
        if (configResponse.code === "OK") {
          let data = configResponse.data;
          PROJECT_LATEST_VERSION = data.projectLatestVersion || CURRENT_VERSION;
        }
        const latestVersion = localStorage.getItem('latestVersion')
        const currentVersion = PROJECT_LATEST_VERSION
        console.log('local storage latest Version', latestVersion)
        console.log('current Version', currentVersion)
        const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
        if (shouldForceRefresh) {
            console.log(`We have a new version - ${latestVersion}. Should force refresh`);
            await this.setState({ loading: false, isLatestVersion: false });
        } else {
            console.log(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
            await this.setState({ loading: false, isLatestVersion: true });
        }
    }
    render() {
        const { loading, isLatestVersion } = this.state;
        return this.props.children({ loading, isLatestVersion, refreshCacheAndReload });
    }
}

export default CacheBuster;
