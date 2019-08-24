const getRawResource = (url, callback) => {
    const resource = new XMLHttpRequest();

    resource.onreadystatechange = (data) => {
        if(resource.readyState === XMLHttpRequest.DONE) {
            callback(resource.status, resource.responseText, url);
        }
    };
    resource.open("GET", url);
    resource.send();
};

const getResource = (url, callback) => {
    const wrapper = (stat, data, url) => {
        callback(stat, JSON.parse(data), url);
    };
    getRawResource(url, wrapper);
};
