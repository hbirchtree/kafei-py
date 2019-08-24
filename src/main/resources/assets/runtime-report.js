const reportList = document.querySelector('#reportList');
const reportLoader = document.querySelector('#reportLoader');
const reportModal = document.querySelector('#reportModal');

getResource(server + '/v2/reports', (stat, data, url) => {
    if(stat !== 200)
    {
        reportStatus.classList.add('error');
        return;
    }

    const modalStereotype = reportModal.querySelector('.stereotype-field');
    const modalId = reportModal.querySelector('.id-field');
    const modalField = reportModal.querySelector('.modal-field');
    modalStereotype.innerText = 'Report';
    const modalGrid = reportModal.querySelector('.grid');

    for(var i=0; i<3; i++)
        modalGrid.appendChild(modalField.cloneNode(true));

    const nameList = reportModal.querySelectorAll('.column.header');
    const valueList = reportModal.querySelectorAll('.column:not(.header)');

    var i = 0;
    nameList.forEach(field => {
        switch(i)
        {
            case 0:
                field.querySelector('.icon').classList.add('box');
                break;
            case 1:
                field.querySelector('.icon').classList.add('cog');
                break;
            case 2:
                field.querySelector('.icon').classList.add('microchip');
                break;
            case 3:
                field.querySelector('.icon').classList.add('tv');
                break;
        }
        i++;
    });

    data.data.forEach(report => {
        const element = reportList.appendChild(document.querySelector('#reportTemplate').cloneNode(true));
        const iconElement = element.querySelector('i.icon');

        var i = 0;
        element.querySelectorAll('.column').forEach(field => {
            switch(i)
            {
                case 0:
                    field.innerText = report.data.reportId;
                    break;
                case 2:
                    field.innerText = report.data.system;
                    break;
                case 5:
                    field.innerText = new Date(report.data.submitTime).toISOString();
                    break;
                case 6:
                    field.querySelector('.profile-link').href = server + report.links[1].uri;
                    break;
            }
            i++;
        });
        element.style.display = 'block';

        iconElement.classList.add(systemToIcon(report.data.system));

        const appField = element.querySelectorAll('.column')[3];
        const buildField = element.querySelectorAll('.column')[4];

        getResource(server + report.links[0].uri, (stat, data) => {
            if(stat !== 200)
            {
                appField.querySelector('.placeholder').style.display = 'none';
                buildField.querySelector('.placeholder').style.display = 'none';
                appField.querySelector('.label').style.display = 'block';
                buildField.querySelector('.label').style.display = 'block';
                return;
            }

            console.log(data.data.device.version);
            iconElement.classList.add(systemToIcon(data.data.device.version));

            element.addEventListener('click', () => {
                const reportD = data.data;
                modalId.innerText = report.data.reportId;
                var i = 0;
                valueList.forEach(field => {
                    switch(i)
                    {
                        case 0:
                            field.innerHTML =
                                "<h4 class='ui header'>Application</h4>" +
                                "<p><strong>name</strong> "+ reportD.application.name + "</p>" +
                                "<p><strong>version</strong> " + reportD.application.version + "</p>" +
                                "<p><strong>writer</strong> "+ reportD.application.organization + "</p>";
                            break;
                        case 1:
                            field.innerHTML =
                                "<h4 class='ui header'>Build</h4>" +
                                "<p><strong>version</strong> "+ reportD.build.version + "</p>" +
                                "<p><strong>compiler</strong> "+ reportD.build.compiler + "</p>" +
                                "<p><strong>architecture</strong> "+ reportD.build.architecture + "</p>" +
                                "<p><strong>mode</strong> "+ reportD.build.buildMode + "</p>";
                            break;
                        case 2:
                            field.innerHTML =
                                "<h4 class='ui header'>System</h4>" +
                                "<p><strong>device</strong> "+ reportD.device.name + "</p>" +
                                "<p><strong>motherboard</strong> "+ reportD.device.motherboard + "</p>" +
                                "<p><strong>os</strong> "+ reportD.runtime.system + "</p>" +
                                "<p><strong>os version</strong> "+ reportD.device.version + "</p>" +
                                "<p><strong>processor</strong> "+ reportD.processor.model + "</p>";
                            break;
                        case 3:
                            field.innerHTML =
                                "<h4 class='ui header'>Graphics</h4>" +
                                "<p><strong>library</strong> "+ reportD.extra['window:library'] + "</p>" +
                                "<p><strong>renderer</strong> "+ reportD.extra['gl:renderer'] + "</p>" +
                                "<p><strong>version</strong> "+ reportD.extra['gl:version'] + "</p>" +
                                "<p><strong>driver</strong> "+ reportD.extra['gl:driver'] + "</p>" +
                                "<p><strong>shader version</strong> "+ reportD.extra['gl:glsl_version'] + "</p>"
                                ;
                            break;
                    }
                    i++;
                });

                $('#reportModal').modal('show');
            });

            appField.innerText = data.data.application.name;
            buildField.innerText = data.data.build.buildMode + " @ " + data.data.build.version;
        });
    });

    reportLoader.style.opacity = 0;
    reportList.style.opacity = 1;
    setTimeout(() => {
        reportLoader.style.display = 'none';
    }, 100);
});