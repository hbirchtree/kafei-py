const crashList = document.querySelector('#crashList');
const crashLoader = document.querySelector('#crashLoader');
const crashModal = document.querySelector('#crashModal');

const createErrorElement = (error) =>
{
    const msg = document.createElement('div');
    msg.classList.add('ui');
    msg.classList.add('orange');
    msg.classList.add('segment');
    msg.classList.add('inverted');
    msg.innerText = error;

    return msg;
};

const createListElement = (label, value) => {
    const p = document.createElement('p');
    const labelElement = document.createElement('strong');
    const valueElement = document.createElement('span');

    p.appendChild(labelElement);
    p.appendChild(valueElement);
    valueElement.style['margin-left'] = '0.2em';

    labelElement.innerText = label;
    valueElement.innerText = value;

    return p;
};

getResource(server + '/v2/crash', (stat, data, url) => {
    if(stat !== 200)
    {
        reportStatus.classList.add('error');
        return;
    }

    data.data.forEach(crash => {
        const element = crashList.appendChild(document.querySelector('#crashTemplate').cloneNode(true));

        element.addEventListener('click', () => {
            const errLog = crashModal.querySelector('.err-log');
            errLog.querySelector('.ui.placeholder').style.display = 'block';
            errLog.querySelectorAll('.segment').forEach(block => {
                errLog.removeChild(block);
            });

            $('#crashModal').modal('show');

            crashModal.querySelector('.id-field').innerText = crash.data.crashId;

            getRawResource(server + crash.links[2].uri, (stat, data, url) => {
                if(stat !== 200)
                {
                    errLog.querySelector('.ui.placeholder').style.display = 'none';
                    errLog.appendChild(createErrorElement('Failed to find the crash in the log'));
                    return;
                }

                var log = data.substr(data.indexOf('exception encountered'));
                if(log.length < 10)
                {
                    errLog.appendChild(createErrorElement('Crash was not automatically detected'));
                    log = data;
                }
                const container = document.createElement('div');
                container.classList.add('segment');

                log = log.replace(new RegExp('\\[[0-9]+m', 'g'), '');

                log.split('\n').forEach(line => {
                    const lineContainer = document.createElement('p');
                    lineContainer.innerText = line;
                    container.appendChild(lineContainer);
                });

                const code = document.createElement('div');
                code.classList.add('segment');

                code.innerText = 'Application exited with ' + crash.data.exitCode;

                errLog.appendChild(code);
                errLog.appendChild(container);
                errLog.querySelector('.ui.placeholder').style.display = 'none';
            });

            const infoLog = crashModal.querySelector('.info-log');
            infoLog.querySelectorAll('.segment').forEach(block => {
                infoLog.removeChild(block);
            });
            getRawResource(server + crash.links[1].uri, (stat, data, url) => {
                if(stat !== 200)
                {
                    infoLog.querySelector('.ui.placeholder').style.display = 'none';
                    infoLog.appendChild(createErrorElement('Failed to load log'));
                    return;
                }

                const container = document.createElement('div');
                container.classList.add('segment');

                const details = infoLog.querySelector('.grid');
                const icon = details.querySelector('.icon');

                ['.app-details', '.build-details', '.system-details'].forEach(c => {
                    const detailText = infoLog.querySelector(c).querySelector('.column:not(.header)')
                        .querySelectorAll('p').forEach(e => {
                            infoLog.querySelector(c).querySelector('.column:not(.header)').removeChild(e);
                        });
                });

                const appDetails = data.match("(.*), released by (.*), version ([0-9]+) \\((.*) mode\\)").slice(1, 10);
                const versionDetails = data.match("Running Coffee build ([a-z0-9.-]*)").slice(1, 10);
                const compilerDetails = data.match("Compiled for (.*) on (.*) \\((.*)\\)").slice(1, 10);
                const runtimeDetails = data.match("Executing on (.*) \\((.*)\\)").slice(1, 10);
                const deviceDetails = data.match("Device: (.*)").slice(1, 10);

                const allDetails = appDetails.concat(versionDetails).concat(compilerDetails)
                    .concat(runtimeDetails).concat(deviceDetails);

                const makeLabel = (start_idx) => {
                    return (label, i) => {
                        return createListElement(label, allDetails[start_idx + i]);
                    };
                };

                ['name', 'writer', 'version'].map(makeLabel(0)).map(e => {
                    infoLog.querySelector('.app-details')
                        .querySelector('.column:not(.header)')
                        .appendChild(e);
                });
                ['mode', 'version', 'compile system',
                    'compiler', 'compile architecture'].map(makeLabel(3)).map(e => {
                    infoLog.querySelector('.build-details')
                                            .querySelector('.column:not(.header)')
                                            .appendChild(e);
                });
                ['runtime system', 'runtime architecture', 'device'].map(makeLabel(8)).map(e => {
                    infoLog.querySelector('.system-details')
                                            .querySelector('.column:not(.header)')
                                            .appendChild(e);
                });

                infoLog.querySelector('.ui.placeholder').style.display = 'none';
            });

            infoLog.querySelector('.graphics-details').querySelectorAll('p').forEach(e => {
                infoLog.querySelector('.graphics-details .column:not(.header)').removeChild(e);
            });

            getResource(server + crash.links[4].uri, (stat, data, url) => {
                const graphicsBox = infoLog.querySelector('.graphics-details');

                if(stat !== 200)
                {
                    graphicsBox.style.display = 'none';
                    return;
                }

                const graphicsList = graphicsBox.querySelector('.column:not(.header)');

                graphicsList.appendChild(createListElement('library', data.extra['window:library']));
                graphicsList.appendChild(createListElement('renderer', data.extra['gl:renderer']));
                graphicsList.appendChild(createListElement('version', data.extra['gl:version']));
                if(data.extra['gl:driver'].length > 0)
                    graphicsList.appendChild(createListElement('driver', data.extra['gl:driver']));
                graphicsList.appendChild(createListElement('shader version', data.extra['gl:glsl_version']));

                data.extra['gl:limits'].split(',').forEach(lim => {
                    console.log(lim);
                });

                graphicsBox.style.display = 'block';
            });
        });

        var i = 0;
        element.querySelectorAll('div.column').forEach(field => {
            switch(i)
            {
                case 0:
                    field.innerText = crash.data.crashId;
                    break;
                case 1:
                    field.innerText = new Date(crash.data.submitTime).toISOString();
                    break;
                case 2:
                    field.querySelector('.stdout-link').href = server + crash.links[1].uri;
                    field.querySelector('.stderr-link').href = server + crash.links[2].uri;
                    field.querySelector('.profile-link').href = server + crash.links[3].uri;
                    break;
            }
            i++;
        });
        element.style.display = 'block';
    });

    crashLoader.style.opacity = 0;
    crashList.style.opacity = 1;
    setTimeout(() => {
        crashLoader.style.display = 'none';
    }, 100);
});
