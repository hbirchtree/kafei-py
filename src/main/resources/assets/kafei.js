
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function $(q)
{
    return document.querySelector(q);
}

var current = document.getElementById("home");

function loadElement(name)
{
    let el = document.getElementById(name);
    current.style['display'] = 'none';
    el.style['display'] = 'flex';
    current = el;

    if(name != 'exframe' && location.search != '')
    {
        location.search = '';
    }

    return current;
}

function loadElementPreload(name)
{
    return function() {
        return loadElement(name);
    };
}

function shortenText(msg, max_len, max_lines)
{
    if(msg.length > max_len)
    {
        msg = msg.substring(0, max_len - 3) + '...';
    }
    var numNewLines = 0;
    var msgIdx = 0;
    while((msgIdx = msg.indexOf('\n', msgIdx + 1)) >= 0)
    {
        numNewLines ++;

        if(numNewLines > (max_lines - 1))
        {
            msg = msg.substring(0, msgIdx);
            break;
        }
    }

    return msg;
}

function loadHome()
{
    loadElement("home");

    let releaseInfo = new XMLHttpRequest();

    releaseInfo.addEventListener('load', function()
    {
        let release = JSON.parse(this.responseText).data;

        /*
        let relDate = $('#release-date');
        let relTag = $('#release-tag');
        let relMsg = $('#release-notes');
        let relAuthor = $('#release-author');
        let relLink = $('#release-link');

        relMsg.innerHTML = shortenText(release.release.body, 100, 2).replace('\n', '<br>');
        relLink.href = release.release.author.html_url;
        relTag.innerText = release.release.tag_name;
        relDate.innerText = new Date(release.release.published_at).toUTCString();
        relLink.href = release.release.html_url;
        */

        let relTag = $('#author-username');
        let relMsg = $('#author-notes');
        let relAuthor = $('#release-author');
        let relLink = $('#author-link');
        let bubLink = $('#home-author-bubble');

        relTag.innerHTML = release.release.author.login;
        relMsg.innerHTML = 'All my code is on GitHub!';
        relAuthor.src = release.release.author.avatar_url;
        relLink.href = release.release.author.html_url;
        bubLink.href = relLink.href;
    });

    releaseInfo.open('GET', '/api/github/latestRelease');
    releaseInfo.send();
}

function loadExamples()
{
    loadElement("examples");

    let updateInfo = new XMLHttpRequest();

    updateInfo.addEventListener('load', function(){
        let info_base = JSON.parse(this.responseText);
        let info = info_base.data.head_commit;

        if(info === undefined)
            info = info_base.data.commit;

        let avatImg = $('#avatar-img');
        /* We get a perfectly fitting avatar image from GitHub,
         *  avoiding the 512x512 image */
        avatImg.src = info_base.data.sender.avatar_url + "&s=" + avatImg.width;

        let commitLink = $('#commit-link');
        let authorLink = $('#avatar-link');
        let commitMsg = $('#commit-message');
        let commitDate = $('#commit-date');
        let commitSha = $('#commit-sha');

        /* For commit message, restrict it to
         *  fit into the commit message box */
        var msg = info.message;
        msg = shortenText(msg, 200, 3);
        msg = msg.replace(/\n/g, '<br>');
        commitMsg.innerHTML = msg;

        authorLink.href = info.committer.html_url;
        commitLink.href = info.html_url;
        /* SHA is massif. Shorten it. */
        commitSha.innerText = shortenText(info.id, 23, 2);
        /* Format the date to look a bit more appealing */
        commitDate.innerText = new Date(info_base.updated_at).toUTCString();
    });


    let releaseInfo = new XMLHttpRequest();

    releaseInfo.addEventListener('load', function() {
        let releaseLink = $('#examples-release-link');
        let release = JSON.parse(this.responseText).data;
        releaseLink.href = release.release.html_url;
    });

    updateInfo.open('GET', '/api/github/updateInfo');
    updateInfo.send();
    releaseInfo.open('GET', '/api/github/latestRelease');
    releaseInfo.send();
}

function createStat(query, canvasId, nameField, chartType)
{
    let statDoc = new XMLHttpRequest();

    statDoc.addEventListener('load', function()
    {
        let data = JSON.parse(this.responseText).data;
        let canvas = $('#' + canvasId);

        var blabels = [];
        var bcounts = [];

        for(var i=0;i<data.length; i++)
        {
            var m = data[i];
            blabels = blabels.concat(m[nameField]);
            bcounts = bcounts.concat(m.count);
        }

        var ctxt = canvas.getContext('2d');

        var chart = new Chart(ctxt,
        {
            type: chartType,
            data: {
                labels: blabels,
                datasets: [{
                    label: 'Count',
                    data: bcounts,
                    backgroundColor: 'rgba(50, 50, 224, 0.5)'
                }]
            }
        });
    });

    statDoc.open('GET', query);
    statDoc.send();
}

function loadStatistics()
{
    try {
        loadElement('statistics');

        //Chart.defaults.global.defaultColor = 'rgba(255, 255, 255, 0.5)';

        let procQuery = new XMLHttpRequest();

        procQuery.addEventListener('load', function()
        {
            let data = JSON.parse(this.responseText).data;

            let table = $('#processors-view');

            table.innerHTML = '';

            data.map((proc) => {
                var minHz = Infinity;
                var maxHz = -Infinity;
                proc.frequencies.map((fq) => {
                    minHz = Math.round(Math.min(fq, minHz) * 10) / 10;
                    maxHz = Math.round(Math.max(fq, maxHz) * 10) / 10;
                });

                var freqString = minHz + '~' + maxHz + 'GHz';

                table.innerHTML += '<tr><td>' + proc.manufacturer + '</td>' +
                    '<td>' + proc.model + '</td>' +
                    '<td>' + proc.cores + '</td>' +
                    '<td>' + proc.threads + '</td>' +
                    '<td>' + freqString + '</td>' +
                    '</tr>';
            });

        });

        procQuery.open('GET', '/api/v1/processors');
        procQuery.send();

	createStat('/api/v1/statistics/os', 'os-ver-stats-view', 'system', 'doughnut');
	createStat('/api/v1/statistics/arch', 'arch-stats-view', 'architecture', 'bar');
	//createStat('/api/v1/statistics/os-arch', 'os-arch-correlation-view', 'system', 'radar');
    } catch(e) {
        $("#stat-service-unavailable").style.display = 'block';
    }
}

function loadSingleExample(example)
{
    return function()
    {
        loadElement('exframe');

        var element = $('#exiframe');

        element.onload = function() {
            let body = $('body');
            let otherBody = element.contentDocument.getElementsByTagName('body')[0];

            let bodyStyle = window.getComputedStyle(body);
            otherBody.style['background-color'] = bodyStyle['background-color'];
        };

        element.src = '/examples/'
            + example + '.bundle/'
            + example + '.html';

    };
}

function getArg(query, arg)
{
    query = query.substr(1, query.length + 1);

    var i = query.indexOf(arg);
    var nextI = query.indexOf('&');
    if(nextI == -1)
        nextI = query.length;
    if(i >= 0)
        return query.substr(query.indexOf('=') + 1);
}

function loadSingleExamplePage()
{
    var example = getArg(location.search, 'sample');
    loadSingleExample(example)();
}

function showExample(name)
{
    location = '/?sample=' + name + '#exframe';
}

let pageReferences = {
    home: loadHome,
    stats: loadStatistics,
    examples: loadExamples,
    building: loadElementPreload('building'),
    exframe: loadSingleExamplePage
};

if(window.mobilecheck())
    $('html').classList.add('is-mobile');
else
    $('html').classList.add('is-desktop');

window.onhashchange = function()
{
    var hash = location.hash.replace('#', '');
    if(location.hash.length > 0)
        pageReferences[hash]();
    else
        loadHome();

};

window.onhashchange();
