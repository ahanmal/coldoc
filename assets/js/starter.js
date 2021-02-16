
import "../../node_modules/jquery/dist/jquery.js"
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../node_modules/bootstrap-table/dist/bootstrap-table.min.js";
import "../../node_modules/marked/lib/marked.js"


function detailFormatter(index, row) {
    return `${row.description} <button type="button" class="btn btn-success float-right accept-btn">Accept</button>`;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

document.body.onkeypress = function (e) {
    if (e.keyCode == 32) {
        $('#trial-start').remove();
        document.body.onkeypress = null;
        window.startTime = (new Date()).getTime();
        window.misses = 0;
        window.inspected = 0;
        return false;
    }
};

window.addEventListener('load', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    let trial = urlParams.get('trial');
    if (!trial) {
        $('#trial-start').remove();
        document.body.onkeypress = null;
        return;
    }

    let searchType = trial.substring(0, 1);
    let test = trial.substring(1, 2);

    window.search = searchType == 'a' ? true : false;

    switch (test) {
        case '1':
            window.correct_name = 'split';
            break;
        case '2':
            window.correct_name = 'map2';
            break;
        case '3':
            window.correct_name = 'mem';
            break;
    }
});


var $table = $('#table');
$.getJSON("/list.json", data => {

    data.functions.map(el => {
        let backgroundRGB = hexToRgb(data.categories[el.tags]);
        let textColor = ((backgroundRGB.r * 0.299 + backgroundRGB.g * 0.587 + backgroundRGB.b * 0.114) > 186) ? "black" : "white";

        el.tags = `<span class="badge bg-primary" style="color: ${textColor}; background-color: ${data.categories[el.tags]} !important">${el.tags}</span>`
        el.name = `<code>${el.name}</code>`;
        el.arg_a = `<code>${el.arg_a}</code>`;
        el.arg_b = `<code>${el.arg_b}</code>`;
        el.arg_c = `<code>${el.arg_c}</code>`;
        el.arg_d = `<code>${el.arg_d}</code>`;
        el.return = `<code>${el.return}</code>`;
    });

    $('#name').html(`Module <code>${data.module_name}</code>`);
    $('#top-text').html(data.top_html);

    $table.bootstrapTable({
        data: data.functions,
        classes: 'table table-bordered',
        detailFormatter: detailFormatter,
        search: window.search
    });
});

$('#table').on('expand-row.bs.table', function (index, row, detail) {
    window.inspected += 1;
    $(".accept-btn").click(function (e) {
        let name = detail.name.replace('<code>', '').replace('</code>', '');
        if (name == window.correct_name) {
            let endTime = (new Date()).getTime();
            let diff = endTime - window.startTime;
            let elapsedSeconds = diff / 1000.0;
            alert(`Elapsed: ${elapsedSeconds} s\nMisses: ${window.misses}\nInspects: ${window.inspected}`);
        } else {
            $(e.target).text('Try Again');
            $(e.target).attr('disabled', true);
            $(e.target).removeClass('btn-success');
            $(e.target).addClass('btn-danger');
            window.misses += 1;
        }

    });
});






